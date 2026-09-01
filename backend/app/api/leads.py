import secrets
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from pydantic import BaseModel, Field

from app.analytics import RateLimiter, parse_uuid
from app.db import pool
from app.notify import notify_new_lead
from app.paths import UPLOAD_DIR

router = APIRouter()
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXT = {".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".zip"}
MAX_FILE = 25 * 1024 * 1024
lead_limiter = RateLimiter(max_hits=8, window_sec=600.0)


class LeadIn(BaseModel):
    name: str = Field(default="", max_length=200)
    phone: str = Field(min_length=10, max_length=32)
    drawing: str = Field(default="no", pattern="^(yes|no)$")
    comment: str = Field(default="", max_length=4000)
    file_name: str = Field(default="", max_length=300)
    source: str = Field(default="", max_length=300)
    visitor_id: str = Field(default="", max_length=36)
    session_id: str = Field(default="", max_length=36)


@router.post("/leads")
async def create_lead(request: Request, background: BackgroundTasks) -> dict:
    ip = request.client.host if request.client else ""
    if ip and not lead_limiter.allow(ip):
        raise HTTPException(status_code=429, detail="Слишком много заявок. Попробуйте позже.")

    content_type = request.headers.get("content-type", "")

    file_name = ""
    file_path = ""
    file_size = 0
    file_mime = ""

    if "multipart/form-data" in content_type:
        form = await request.form()
        honeypot = str(form.get("website", "") or form.get("company_url", "")).strip()
        if honeypot:
            return {"ok": True, "id": 0}

        file = form.get("file")
        if file and getattr(file, "filename", ""):
            original_name = Path(file.filename).name
            ext = Path(original_name).suffix.lower()
            if ext not in ALLOWED_EXT:
                raise HTTPException(status_code=422, detail="Файл: PDF, DOC, DOCX, JPG, PNG или ZIP")
            data = await file.read()
            if len(data) > MAX_FILE:
                raise HTTPException(status_code=422, detail="Файл больше 25 МБ — пришлите ссылкой или сожмите")
            safe_name = f"{secrets.token_hex(12)}{ext}"
            target = UPLOAD_DIR / safe_name
            target.write_bytes(data)
            file_name = original_name
            file_path = f"/uploads/{safe_name}"
            file_size = len(data)
            file_mime = getattr(file, "content_type", "") or ""

        lead = LeadIn(
            name=str(form.get("name", "")),
            phone=str(form.get("phone", "")),
            drawing=str(form.get("drawing", "no")),
            comment=str(form.get("comment", "")),
            file_name=file_name or str(form.get("file_name", "")),
            source=str(form.get("source", "")),
            visitor_id=str(form.get("visitor_id", "")),
            session_id=str(form.get("session_id", "")),
        )
    else:
        raw_body = await request.json()
        if not isinstance(raw_body, dict):
            raise HTTPException(status_code=422, detail="Некорректная заявка")
        if str(raw_body.get("website", "") or raw_body.get("company_url", "")).strip():
            return {"ok": True, "id": 0}
        lead = LeadIn.model_validate(raw_body)

    if not lead.phone.strip():
        raise HTTPException(status_code=422, detail="Телефон обязателен")
    with pool.connection() as conn:
        row = conn.execute(
            """
            INSERT INTO leads (
                name, phone, has_drawing, comment, file_name, file_path, file_size, file_mime,
                source, visitor_id, session_id
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::uuid, %s::uuid)
            RETURNING id
            """,
            (
                lead.name.strip(),
                lead.phone.strip(),
                lead.drawing == "yes",
                lead.comment.strip(),
                lead.file_name.strip(),
                file_path,
                file_size,
                file_mime,
                lead.source.strip(),
                parse_uuid(lead.visitor_id),
                parse_uuid(lead.session_id),
            ),
        ).fetchone()
    lead_id = row[0]
    background.add_task(
        notify_new_lead,
        lead_id,
        lead.name.strip(),
        lead.phone.strip(),
        lead.drawing == "yes",
        lead.comment.strip(),
        lead.file_name.strip() or file_name,
        lead.source.strip(),
        file_path,
    )
    return {"ok": True, "id": lead_id}
