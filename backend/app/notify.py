"""Уведомления о заявках через Telegram Bot API.

Бот — курьер. Доступ к API — через Cloudflare Worker (TELEGRAM_API_BASE).
"""

from __future__ import annotations

import json
import logging
import mimetypes
import re
import socket
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse
from uuid import uuid4

from app.config import settings
from app.db import pool
from app.paths import UPLOAD_DIR

log = logging.getLogger("app.notify")

PAGE_NAMES = {
    "/": "Главная",
    "/services": "Услуги",
    "/cases": "Кейсы",
    "/about": "О компании",
    "/contacts": "Контакты",
    "/insights": "Insights",
    "/privacy": "Политика конфиденциальности",
}
TG_FILE_LIMIT = 45 * 1024 * 1024
_OFFICIAL_API = "https://api.telegram.org"
# Cloudflare Bot Fight Mode режет Python-urllib (HTTP 403 / 1010).
_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)
_last_error = ""


def last_telegram_error() -> str:
    return _last_error


def _api_base() -> str:
    return (settings.telegram_api_base or _OFFICIAL_API).strip().rstrip("/")


def _uses_relay() -> bool:
    raw = (settings.telegram_api_base or "").strip()
    return bool(raw) and "api.telegram.org" not in raw.lower()


def explain_telegram_error(raw: str) -> str:
    text = (raw or "").strip()
    low = text.lower()
    if "1010" in text:
        return "Cloudflare 1010: воркер отбил запрос сервера (Bot Fight Mode)."
    if "11001" in text or "getaddrinfo" in low or "name or service not known" in low:
        return "Сервер не резолвит хост Cloudflare (DNS)."
    if "timed out" in low or "timeout" in low:
        return "Таймаут до Cloudflare Worker."
    if "connection refused" in low or "10061" in text:
        return "Cloudflare: соединение отклонено."
    if "network is unreachable" in low or "10051" in text:
        return "Сеть сервера не пускает до Cloudflare."
    if "unauthorized" in low:
        return "Telegram не принял токен."
    if "conflict" in low and "webhook" in low:
        return "У бота включён webhook, getUpdates пустой."
    return text or "нет ответа"


def probe_cloudflare() -> dict:
    """Доходит ли этот сервер до воркера, ещё до вызова Telegram."""
    base = _api_base()
    parsed = urlparse(base)
    host = parsed.hostname or ""
    port = parsed.port or (443 if (parsed.scheme or "https") == "https" else 80)
    out = {"ok": False, "host": host, "ip": "", "ms": None, "detail": ""}
    if not host:
        out["detail"] = "TELEGRAM_API_BASE пустой"
        return out
    started = time.perf_counter()
    try:
        infos = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
        out["ip"] = infos[0][4][0]
    except OSError as exc:
        out["ms"] = int((time.perf_counter() - started) * 1000)
        out["detail"] = f"DNS {host}: {exc}"
        return out
    try:
        sock = socket.create_connection((out["ip"], port), 8)
        sock.close()
    except OSError as exc:
        out["ms"] = int((time.perf_counter() - started) * 1000)
        out["detail"] = f"TCP {host}:{port} ({out['ip']}): {exc}"
        return out
    try:
        req = urllib.request.Request(
            f"{base}/",
            headers={"User-Agent": _UA, "Accept": "*/*"},
        )
        with urllib.request.urlopen(req, timeout=12) as resp:
            out["ok"] = True
            out["detail"] = f"{host} → {out['ip']} · HTTP {resp.status}"
    except urllib.error.HTTPError as exc:
        body = exc.read()[:120]
        # 404/403 от воркера или Telegram всё равно значит: HTTPS дошёл.
        out["ok"] = exc.code != 1010 and "1010" not in body.decode("utf-8", errors="replace")
        out["detail"] = f"{host} → {out['ip']} · HTTP {exc.code}"
        if "1010" in body.decode("utf-8", errors="replace"):
            out["ok"] = False
            out["detail"] += " (1010)"
    except Exception as exc:
        out["detail"] = f"HTTPS {host}: {getattr(exc, 'reason', exc)}"
    out["ms"] = int((time.perf_counter() - started) * 1000)
    return out


def _esc(value: str) -> str:
    return (
        (value or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def _page_label(path: str) -> str:
    clean = (path or "").split("?")[0] or "/"
    if clean in PAGE_NAMES:
        return PAGE_NAMES[clean]
    if clean.startswith("/services/"):
        slug = clean[10:].rstrip("/").split("/")[-1].replace("-", " ")
        return f"Услуга · {slug}" if slug else "Услуги"
    if clean.startswith("/cases/"):
        slug = clean[7:].rstrip("/").replace("-", " ")
        return f"Кейс · {slug}" if slug else "Кейсы"
    return clean or "—"


def international_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone or "")
    if not digits:
        return ""
    if digits.startswith("8") and len(digits) == 11:
        digits = "7" + digits[1:]
    if digits.startswith("7") and len(digits) >= 11:
        return "+" + digits[:11]
    return "+" + digits if not (phone or "").startswith("+") else phone.strip()


def pretty_phone(phone: str) -> str:
    intl = international_phone(phone)
    digits = re.sub(r"\D", "", intl)
    if len(digits) == 11 and digits.startswith("7"):
        return f"+7 ({digits[1:4]}) {digits[4:7]}-{digits[7:9]}-{digits[9:11]}"
    return intl or phone


def telegram_configured() -> bool:
    return bool(settings.telegram_bot_token.strip())


def telegram_api(method: str, payload: dict | None = None, file: Path | None = None) -> dict:
    global _last_error
    token = settings.telegram_bot_token.strip()
    if not token:
        return {}
    url = f"{_api_base()}/bot{token}/{method}"
    try:
        if file and file.is_file():
            data, headers = _multipart(payload or {}, file)
            headers["User-Agent"] = _UA
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        else:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload or {}).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "User-Agent": _UA,
                },
                method="POST",
            )
        with urllib.request.urlopen(req, timeout=20) as resp:
            _last_error = ""
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:400]
        _last_error = f"HTTP {exc.code}: {detail[:180]}"
        log.warning("Telegram %s HTTP %s: %s", method, exc.code, detail)
        try:
            return json.loads(detail)
        except json.JSONDecodeError:
            return {"ok": False, "description": detail}
    except Exception as exc:
        _last_error = str(exc.reason if getattr(exc, "reason", None) else exc)
        log.warning("Telegram %s не удался: %s", method, _last_error)
        return {"ok": False, "description": _last_error}


def _multipart(fields: dict[str, Any], file: Path) -> tuple[bytes, dict[str, str]]:
    boundary = uuid4().hex
    chunks: list[bytes] = []
    for key, value in fields.items():
        if value is None:
            continue
        chunks.append(f"--{boundary}\r\n".encode())
        chunks.append(f'Content-Disposition: form-data; name="{key}"\r\n\r\n'.encode())
        chunks.append(f"{value}\r\n".encode())
    mime = mimetypes.guess_type(file.name)[0] or "application/octet-stream"
    chunks.append(f"--{boundary}\r\n".encode())
    chunks.append(
        f'Content-Disposition: form-data; name="document"; filename="{file.name}"\r\n'.encode()
    )
    chunks.append(f"Content-Type: {mime}\r\n\r\n".encode())
    chunks.append(file.read_bytes())
    chunks.append(b"\r\n")
    chunks.append(f"--{boundary}--\r\n".encode())
    return b"".join(chunks), {"Content-Type": f"multipart/form-data; boundary={boundary}"}


def bot_info() -> dict:
    if not telegram_configured():
        return {"ok": False, "configured": False, "api_base": _api_base(), "via_relay": _uses_relay()}
    data = telegram_api("getMe")
    result = data.get("result") or {}
    raw_error = "" if data.get("ok") else (data.get("description") or last_telegram_error())
    return {
        "ok": bool(data.get("ok")),
        "configured": True,
        "username": result.get("username") or "",
        "name": result.get("first_name") or "",
        "id": result.get("id"),
        "error": explain_telegram_error(raw_error) if raw_error else "",
        "api_base": _api_base(),
        "via_relay": _uses_relay(),
    }


def _fmt_ts(value: int | None) -> str:
    if not value:
        return ""
    return datetime.fromtimestamp(int(value), tz=timezone.utc).astimezone().strftime("%d.%m %H:%M")


def _parse_updates(data: dict) -> tuple[list[dict], list[dict], int]:
    known = {r["chat_id"] for r in list_recipients()}
    pending: dict[str, dict] = {}
    recent: list[dict] = []
    join_code = settings.telegram_join_code.strip()
    items = data.get("result") or []
    for upd in items:
        msg = upd.get("message") or upd.get("channel_post") or {}
        chat = msg.get("chat") or {}
        chat_id = str(chat.get("id") or "")
        if not chat_id:
            continue
        text = (msg.get("text") or "").strip()
        first = chat.get("first_name") or chat.get("title") or ""
        last = chat.get("last_name") or ""
        name = f"{first} {last}".strip() or "Без имени"
        username = chat.get("username") or ""
        already = chat_id in known
        recent.append(
            {
                "chat_id": chat_id,
                "name": name,
                "username": username,
                "text": text[:80],
                "at": _fmt_ts(msg.get("date")),
                "already": already,
            }
        )
        if already:
            continue
        if join_code and text.lower().startswith("/join"):
            parts = text.split(maxsplit=1)
            if len(parts) == 2 and parts[1].strip() == join_code:
                upsert_recipient(chat_id, name, username)
                send_welcome(chat_id)
                known.add(chat_id)
                continue
        pending[chat_id] = {
            "chat_id": chat_id,
            "name": name,
            "username": username,
            "type": chat.get("type") or "private",
            "text": text[:80],
            "at": _fmt_ts(msg.get("date")),
        }
    return list(pending.values()), recent[-12:], len(items)


def telegram_diagnostics() -> dict:
    token = settings.telegram_bot_token.strip()
    checks: list[dict] = []
    checks.append(
        {
            "id": "token",
            "ok": bool(token),
            "title": "Токен бота",
            "detail": f"задан, заканчивается на …{token[-4:]}" if len(token) >= 4 else (
                "TELEGRAM_BOT_TOKEN пустой"
            ),
        }
    )
    if _uses_relay():
        relay_detail = _api_base()
        relay_ok = True
    else:
        relay_detail = "TELEGRAM_API_BASE не задан"
        relay_ok = False
    checks.append({"id": "relay", "ok": relay_ok, "title": "Cloudflare Worker", "detail": relay_detail})

    cf = probe_cloudflare()
    checks.append(
        {
            "id": "cloudflare",
            "ok": cf["ok"],
            "title": "Доступ до Cloudflare",
            "detail": (
                f"{cf['detail']} · {cf['ms']} мс"
                if cf.get("ms") is not None and cf["detail"]
                else (cf["detail"] or "нет данных")
            ),
        }
    )

    info = {
        "ok": False,
        "configured": bool(token),
        "username": "",
        "name": "",
        "id": None,
        "error": "",
        "api_base": _api_base(),
        "via_relay": _uses_relay(),
    }
    pending: list[dict] = []
    recent: list[dict] = []
    updates_count = 0
    webhook_url = ""
    getme_ms = None

    if token:
        started = time.perf_counter()
        me = telegram_api("getMe")
        getme_ms = int((time.perf_counter() - started) * 1000)
        raw = "" if me.get("ok") else (me.get("description") or last_telegram_error())
        result = me.get("result") or {}
        info.update(
            {
                "ok": bool(me.get("ok")),
                "username": result.get("username") or "",
                "name": result.get("first_name") or "",
                "id": result.get("id"),
                "error": explain_telegram_error(raw) if raw else "",
            }
        )
        checks.append(
            {
                "id": "getme",
                "ok": bool(me.get("ok")),
                "title": "Telegram API",
                "detail": (
                    f"@{result.get('username')} · {getme_ms} мс"
                    if me.get("ok")
                    else f"{explain_telegram_error(raw)} · {getme_ms} мс"
                ),
            }
        )
        if me.get("ok"):
            hook = telegram_api("getWebhookInfo")
            webhook_url = ((hook.get("result") or {}).get("url") or "").strip()
            checks.append(
                {
                    "id": "webhook",
                    "ok": not webhook_url,
                    "title": "Режим обновлений",
                    "detail": (
                        f"включён webhook {webhook_url} — список «кто написал» будет пустым"
                        if webhook_url
                        else "polling, webhook нет"
                    ),
                }
            )
            updates = telegram_api("getUpdates", {"timeout": 0, "limit": 50})
            if updates.get("ok"):
                pending, recent, updates_count = _parse_updates(updates)
                checks.append(
                    {
                        "id": "updates",
                        "ok": True,
                        "title": "Сообщения боту",
                        "detail": (
                            f"в очереди {updates_count}, новых людей {len(pending)}"
                            if updates_count
                            else "очередь пустая — напишите боту Start и нажмите «Обновить»"
                        ),
                    }
                )
            else:
                raw_up = updates.get("description") or last_telegram_error()
                checks.append(
                    {
                        "id": "updates",
                        "ok": False,
                        "title": "Сообщения боту",
                        "detail": explain_telegram_error(raw_up),
                    }
                )
    else:
        checks.append({"id": "getme", "ok": False, "title": "Telegram API", "detail": "нет токена"})

    if not info.get("ok") and not cf["ok"]:
        info["error"] = cf["detail"] or info.get("error") or "нет доступа до Cloudflare"

    hint = ""
    failed = next((c for c in checks if not c["ok"] and c["id"] != "relay"), None)
    if not token:
        hint = "Вставьте TELEGRAM_BOT_TOKEN в backend/.env и перезапустите бэкенд."
    elif not info.get("ok"):
        hint = info.get("error") or "Сервер не достучался до Telegram."
    elif webhook_url:
        hint = "Снимите webhook у бота, иначе админка не увидит, кто написал Start."
    elif not pending and not recent:
        hint = "Связь есть, но боту ещё никто не писал. Откройте бота, нажмите Start, затем «Обновить»."
    elif not pending and recent:
        hint = "Бот видит переписку, но все эти люди уже в рассылке или их нет среди новых."
    if not _uses_relay() and info.get("ok"):
        hint = (hint + " ").strip() + " Задайте TELEGRAM_API_BASE на Cloudflare Worker."

    return {
        "configured": bool(token),
        "reachable": bool(info.get("ok")),
        "error": info.get("error") or last_telegram_error(),
        "bot": info,
        "checks": checks,
        "hint": hint.strip(),
        "pending": pending,
        "recent": recent,
        "updates_count": updates_count,
        "webhook_url": webhook_url,
        "join_code": settings.telegram_join_code.strip(),
        "latency_ms": getme_ms,
        "probe": cf,
    }


def list_recipients() -> list[dict]:
    _seed_env_recipients()
    with pool.connection() as conn:
        rows = conn.execute(
            """
            SELECT id, chat_id, name, username, enabled, created_at
            FROM telegram_recipients
            ORDER BY created_at
            """,
        ).fetchall()
    return [
        {
            "id": r[0],
            "chat_id": r[1],
            "name": r[2],
            "username": r[3],
            "enabled": r[4],
            "created_at": r[5].isoformat(),
            "from_env": False,
        }
        for r in rows
    ]


def _seed_env_recipients() -> None:
    raw = settings.telegram_chat_id
    ids = [part.strip() for part in raw.split(",") if part.strip()]
    if not ids:
        return
    with pool.connection() as conn:
        for chat_id in ids:
            conn.execute(
                """
                INSERT INTO telegram_recipients (chat_id, name)
                VALUES (%s, 'из .env')
                ON CONFLICT (chat_id) DO NOTHING
                """,
                (chat_id,),
            )


def enabled_chat_ids() -> list[str]:
    _seed_env_recipients()
    with pool.connection() as conn:
        rows = conn.execute(
            "SELECT chat_id FROM telegram_recipients WHERE enabled = TRUE",
        ).fetchall()
    return [r[0] for r in rows]


def upsert_recipient(chat_id: str, name: str = "", username: str = "") -> dict:
    chat_id = str(chat_id).strip()
    if not chat_id:
        raise ValueError("Пустой chat_id")
    with pool.connection() as conn:
        row = conn.execute(
            """
            INSERT INTO telegram_recipients (chat_id, name, username, enabled)
            VALUES (%s, %s, %s, TRUE)
            ON CONFLICT (chat_id) DO UPDATE SET
                name = CASE WHEN EXCLUDED.name <> '' THEN EXCLUDED.name ELSE telegram_recipients.name END,
                username = CASE WHEN EXCLUDED.username <> '' THEN EXCLUDED.username ELSE telegram_recipients.username END,
                enabled = TRUE
            RETURNING id, chat_id, name, username, enabled, created_at
            """,
            (chat_id, name.strip(), username.strip().lstrip("@")),
        ).fetchone()
    return {
        "id": row[0],
        "chat_id": row[1],
        "name": row[2],
        "username": row[3],
        "enabled": row[4],
        "created_at": row[5].isoformat(),
    }


def set_recipient_enabled(recipient_id: int, enabled: bool) -> None:
    with pool.connection() as conn:
        row = conn.execute(
            "UPDATE telegram_recipients SET enabled = %s WHERE id = %s RETURNING id",
            (enabled, recipient_id),
        ).fetchone()
    if not row:
        raise KeyError(recipient_id)


def delete_recipient(recipient_id: int) -> None:
    with pool.connection() as conn:
        row = conn.execute(
            "DELETE FROM telegram_recipients WHERE id = %s RETURNING id",
            (recipient_id,),
        ).fetchone()
    if not row:
        raise KeyError(recipient_id)


def pending_chats() -> list[dict]:
    """Люди, которые написали боту /start, но ещё не в списке получателей."""
    data = telegram_api("getUpdates", {"timeout": 0, "limit": 50})
    if not data.get("ok"):
        return []
    pending, _, _ = _parse_updates(data)
    return pending


def send_welcome(chat_id: str) -> None:
    telegram_api(
        "sendMessage",
        {
            "chat_id": chat_id,
            "text": "Готово. Сюда будут приходить новые заявки с сайта Podorozhnik.",
        },
    )


def _lead_text(
    lead_id: int,
    name: str,
    phone: str,
    has_drawing: bool,
    comment: str,
    file_name: str,
    source: str,
) -> str:
    shown = pretty_phone(phone) or phone
    lines = [
        f"<b>Новая заявка #{lead_id}</b>",
        "",
        f"📞 <code>{_esc(shown)}</code>",
    ]
    if name:
        lines.append(f"👤 {_esc(name)}")
    if has_drawing:
        lines.append("📎 Есть вложение / бриф")
    if file_name:
        lines.append(f"📎 {_esc(file_name)}")
    if source:
        lines.append(f"🌐 {_esc(_page_label(source))}")
    if comment:
        text = comment if len(comment) <= 1200 else comment[:1200] + "…"
        lines.extend(["", _esc(text)])
    return "\n".join(lines)


def notify_new_lead(
    lead_id: int,
    name: str,
    phone: str,
    has_drawing: bool,
    comment: str,
    file_name: str,
    source: str,
    file_path: str = "",
) -> None:
    if not telegram_configured():
        return
    pending_chats()
    chats = enabled_chat_ids()
    if not chats:
        log.info("Заявка #%s: бот есть, но получатели Telegram не заданы", lead_id)
        return

    text = _lead_text(lead_id, name, phone, has_drawing, comment, file_name, source)
    disk = UPLOAD_DIR / Path(file_path).name if file_path else None
    send_file = bool(disk and disk.is_file() and disk.stat().st_size <= TG_FILE_LIMIT)

    for chat_id in chats:
        msg = telegram_api(
            "sendMessage",
            {
                "chat_id": chat_id,
                "text": text,
                "parse_mode": "HTML",
                "disable_web_page_preview": True,
            },
        )
        mid = ((msg.get("result") or {}) if msg.get("ok") else {}).get("message_id")
        reply = {"reply_to_message_id": mid} if mid else {}

        if send_file and disk:
            telegram_api(
                "sendDocument",
                {
                    "chat_id": chat_id,
                    "caption": file_name or disk.name,
                    **reply,
                },
                file=disk,
            )


def send_test() -> dict:
    chats = enabled_chat_ids()
    if not telegram_configured():
        return {"ok": False, "error": "Токен бота не задан"}
    if not chats:
        return {"ok": False, "error": "Нет получателей"}
    ok = 0
    for chat_id in chats:
        res = telegram_api(
            "sendMessage",
            {
                "chat_id": chat_id,
                "text": "Тест Podorozhnik: уведомления о заявках доходят.",
            },
        )
        if res.get("ok"):
            ok += 1
    return {"ok": ok > 0, "sent": ok, "total": len(chats)}
