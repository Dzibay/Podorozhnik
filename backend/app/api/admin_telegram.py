from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth import require_admin
from app.notify import (
    delete_recipient,
    list_recipients,
    send_test,
    send_welcome,
    set_recipient_enabled,
    telegram_configured,
    telegram_diagnostics,
    upsert_recipient,
)

router = APIRouter(dependencies=[Depends(require_admin)])


class RecipientIn(BaseModel):
    chat_id: str = Field(min_length=1, max_length=32)
    name: str = Field(default="", max_length=120)
    username: str = Field(default="", max_length=64)


class EnabledIn(BaseModel):
    enabled: bool


@router.get("/admin/telegram")
def telegram_status() -> dict:
    data = telegram_diagnostics()
    data["recipients"] = list_recipients()
    return data


@router.post("/admin/telegram/recipients")
def add_recipient(body: RecipientIn) -> dict:
    try:
        rec = upsert_recipient(body.chat_id, body.name, body.username)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    if telegram_configured():
        send_welcome(rec["chat_id"])
    return rec


@router.patch("/admin/telegram/recipients/{recipient_id}")
def toggle_recipient(recipient_id: int, body: EnabledIn) -> dict:
    try:
        set_recipient_enabled(recipient_id, body.enabled)
    except KeyError:
        raise HTTPException(status_code=404, detail="Получатель не найден")
    return {"ok": True, "id": recipient_id, "enabled": body.enabled}


@router.delete("/admin/telegram/recipients/{recipient_id}")
def remove_recipient(recipient_id: int) -> dict:
    try:
        delete_recipient(recipient_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Получатель не найден")
    return {"ok": True, "id": recipient_id}


@router.post("/admin/telegram/test")
def test_telegram() -> dict:
    result = send_test()
    if not result.get("ok"):
        raise HTTPException(status_code=400, detail=result.get("error") or "Не отправилось")
    return result
