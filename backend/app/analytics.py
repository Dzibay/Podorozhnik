"""Сбор аналитики: валидация, очередь в памяти, пакетная запись в Postgres.

Коллектор никогда не тормозит посетителя: /api/t отвечает 204 сразу,
запись в БД идёт фоновым потоком пачками. При переполнении очереди
события отбрасываются — лучше потерять метрику, чем сайт.
"""

from __future__ import annotations

import json
import logging
import queue
import re
import threading
import time
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

from app.db import pool

log = logging.getLogger("app.analytics")

MAX_BATCH_IN = 40
MAX_QUEUE = 8_000
FLUSH_SIZE = 80
FLUSH_INTERVAL = 1.0
STR_LIMITS = {
    "event": 32,
    "path": 300,
    "title": 160,
    "referrer": 400,
    "utm_source": 80,
    "utm_medium": 80,
    "utm_campaign": 120,
    "utm_content": 80,
    "utm_term": 80,
    "label": 120,
    "href": 400,
    "device": 16,
}
EVENT_RE = re.compile(r"^[a-z][a-z0-9_]{0,31}$")
UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    re.I,
)
BOT_MARKERS = (
    "bot",
    "crawler",
    "spider",
    "crawling",
    "googlebot",
    "bingbot",
    "yandexbot",
    "yandex.com/bots",
    "baiduspider",
    "duckduckbot",
    "slurp",
    "ahrefsbot",
    "semrushbot",
    "mj12bot",
    "dotbot",
    "petalbot",
    "gptbot",
    "claudebot",
    "bytespider",
    "applebot",
    "facebookexternalhit",
    "linkedinbot",
    "curl/",
    "wget/",
    "python-requests",
    "go-http-client",
    "httpie",
    "scrapy",
    "headlesschrome",
    "phantomjs",
)

INSERT_SQL = """
INSERT INTO analytics_events (
    occurred_at, visitor_id, session_id, event, path, title,
    referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    label, href, props, device, viewport_w
) VALUES (
    %s, %s::uuid, %s::uuid, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s::jsonb, %s, %s
)
"""


def is_bot(user_agent: str) -> bool:
    ua = (user_agent or "").lower()
    if not ua:
        return False
    return any(marker in ua for marker in BOT_MARKERS)


def _clip(value: Any, limit: int) -> str:
    if value is None:
        return ""
    text = str(value).replace("\x00", "").strip()
    if len(text) > limit:
        return text[:limit]
    return text


def parse_uuid(value: Any) -> str | None:
    text = _clip(value, 36).lower()
    if not UUID_RE.match(text):
        return None
    try:
        UUID(text)
    except ValueError:
        return None
    return text


def _occurred_at(raw: Any) -> datetime:
    now = datetime.now(timezone.utc)
    try:
        ms = int(raw)
    except (TypeError, ValueError):
        return now
    dt = datetime.fromtimestamp(ms / 1000, tz=timezone.utc)
    if dt > now + timedelta(minutes=5) or dt < now - timedelta(hours=26):
        return now
    return dt


def _props(raw: Any) -> str:
    if not isinstance(raw, dict):
        return "{}"
    clean: dict[str, Any] = {}
    for i, (key, val) in enumerate(raw.items()):
        if i >= 8:
            break
        k = _clip(key, 32)
        if not k or not re.match(r"^[a-zA-Z][a-zA-Z0-9_]{0,31}$", k):
            continue
        if isinstance(val, bool) or val is None:
            clean[k] = val
        elif isinstance(val, int) and abs(val) < 10**12:
            clean[k] = val
        elif isinstance(val, float) and abs(val) < 10**12:
            clean[k] = round(val, 4)
        else:
            clean[k] = _clip(val, 160)
    return json.dumps(clean, ensure_ascii=False)


def _device(raw: Any) -> str:
    val = _clip(raw, 16).lower()
    return val if val in {"mobile", "tablet", "desktop"} else ""


def _viewport(raw: Any) -> int | None:
    try:
        n = int(raw)
    except (TypeError, ValueError):
        return None
    if 200 <= n <= 8000:
        return n
    return None


def sanitize_event(raw: Any) -> tuple | None:
    if not isinstance(raw, dict):
        return None
    event = _clip(raw.get("event"), STR_LIMITS["event"]).lower()
    if not EVENT_RE.match(event):
        return None
    visitor_id = parse_uuid(raw.get("visitor_id"))
    session_id = parse_uuid(raw.get("session_id"))
    if not visitor_id or not session_id:
        return None
    path = _clip(raw.get("path"), STR_LIMITS["path"])
    if path and not path.startswith("/"):
        path = "/" + path
    return (
        _occurred_at(raw.get("t")),
        visitor_id,
        session_id,
        event,
        path or "/",
        _clip(raw.get("title"), STR_LIMITS["title"]),
        _clip(raw.get("referrer"), STR_LIMITS["referrer"]),
        _clip(raw.get("utm_source"), STR_LIMITS["utm_source"]),
        _clip(raw.get("utm_medium"), STR_LIMITS["utm_medium"]),
        _clip(raw.get("utm_campaign"), STR_LIMITS["utm_campaign"]),
        _clip(raw.get("utm_content"), STR_LIMITS["utm_content"]),
        _clip(raw.get("utm_term"), STR_LIMITS["utm_term"]),
        _clip(raw.get("label"), STR_LIMITS["label"]),
        _clip(raw.get("href"), STR_LIMITS["href"]),
        _props(raw.get("props")),
        _device(raw.get("device")),
        _viewport(raw.get("viewport_w")),
    )


class EventBuffer:
    def __init__(self) -> None:
        self._q: queue.Queue[tuple] = queue.Queue(maxsize=MAX_QUEUE)
        self._stop = threading.Event()
        self._thread = threading.Thread(target=self._run, name="analytics-flush", daemon=True)
        self._started = False

    def start(self) -> None:
        if self._started:
            return
        self._started = True
        self._thread.start()

    def ingest(self, events: list[Any]) -> int:
        accepted = 0
        for raw in events[:MAX_BATCH_IN]:
            row = sanitize_event(raw)
            if row is None:
                continue
            try:
                self._q.put_nowait(row)
                accepted += 1
            except queue.Full:
                break
        return accepted

    def shutdown(self) -> None:
        self._stop.set()
        if self._started:
            self._thread.join(timeout=4)
            leftover: list[tuple] = []
            while True:
                try:
                    leftover.append(self._q.get_nowait())
                except queue.Empty:
                    break
            if leftover:
                self._flush(leftover)

    def _run(self) -> None:
        batch: list[tuple] = []
        while not self._stop.is_set():
            try:
                batch.append(self._q.get(timeout=FLUSH_INTERVAL))
                while len(batch) < FLUSH_SIZE:
                    batch.append(self._q.get_nowait())
            except queue.Empty:
                pass
            if batch:
                self._flush(batch)
                batch = []

    def _flush(self, rows: list[tuple]) -> None:
        try:
            with pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.executemany(INSERT_SQL, rows)
        except Exception:
            log.exception("Не удалось записать %d событий аналитики", len(rows))


class RateLimiter:
    """Грубый лимит на IP: молча дропаем лишнее, клиент всегда получает 204."""

    def __init__(self, max_hits: int = 40, window_sec: float = 60.0) -> None:
        self.max_hits = max_hits
        self.window = window_sec
        self._hits: dict[str, list[float]] = {}
        self._lock = threading.Lock()

    def allow(self, ip: str) -> bool:
        now = time.monotonic()
        cutoff = now - self.window
        with self._lock:
            stamps = [t for t in self._hits.get(ip, []) if t > cutoff]
            if len(stamps) >= self.max_hits:
                self._hits[ip] = stamps
                return False
            stamps.append(now)
            self._hits[ip] = stamps
            if len(self._hits) > 4000:
                self._hits = {k: v for k, v in self._hits.items() if v and v[-1] > cutoff}
            return True


buffer = EventBuffer()
limiter = RateLimiter()
