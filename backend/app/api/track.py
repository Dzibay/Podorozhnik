import json

from fastapi import APIRouter, Request
from fastapi.responses import Response

from app.analytics import buffer, is_bot, limiter

router = APIRouter()
MAX_BODY = 48_000


@router.post("/t", status_code=204)
async def ingest_events(request: Request) -> Response:
    """Приём пачки событий. Всегда 204 — клиент fire-and-forget."""
    ua = request.headers.get("user-agent", "")
    if is_bot(ua):
        return Response(status_code=204)

    ip = request.client.host if request.client else ""
    if ip and not limiter.allow(ip):
        return Response(status_code=204)

    raw = await request.body()
    if not raw or len(raw) > MAX_BODY:
        return Response(status_code=204)

    try:
        payload = json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError, ValueError):
        return Response(status_code=204)

    events = payload.get("events") if isinstance(payload, dict) else payload
    if isinstance(events, dict):
        events = [events]
    if not isinstance(events, list) or not events:
        return Response(status_code=204)

    buffer.ingest(events)
    return Response(status_code=204)
