import time
from pathlib import Path
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.auth import check_password, make_token, require_admin
from app.db import pool
from app.paths import UPLOAD_DIR

router = APIRouter()


class LoginIn(BaseModel):
    password: str


@router.post("/admin/login")
def login(body: LoginIn) -> dict:
    if not check_password(body.password):
        time.sleep(0.7)  # притормаживаем перебор пароля
        raise HTTPException(status_code=401, detail="Неверный пароль")
    return {"token": make_token()}


@router.get("/admin/leads", dependencies=[Depends(require_admin)])
def list_leads(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict:
    with pool.connection() as conn:
        total = conn.execute("SELECT COUNT(*) FROM leads").fetchone()[0]
        rows = conn.execute(
            """
            SELECT id, name, phone, has_drawing, comment, file_name, file_path, file_size, file_mime, source, created_at
            FROM leads
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
            """,
            (limit, offset),
        ).fetchall()
    items = [
        {
            "id": r[0],
            "name": r[1],
            "phone": r[2],
            "has_drawing": r[3],
            "comment": r[4],
            "file_name": r[5],
            "file_path": r[6],
            "file_size": r[7],
            "file_mime": r[8],
            "source": r[9],
            "created_at": r[10].isoformat(),
        }
        for r in rows
    ]
    return {"total": total, "items": items}


@router.get("/admin/leads/{lead_id}/file", dependencies=[Depends(require_admin)])
def get_lead_file(
    lead_id: int,
    disposition: str = Query(default="inline", pattern="^(inline|attachment)$"),
) -> FileResponse:
    with pool.connection() as conn:
        row = conn.execute(
            "SELECT file_name, file_path, file_mime FROM leads WHERE id = %s",
            (lead_id,),
        ).fetchone()
    if not row or not row[1]:
        raise HTTPException(status_code=404, detail="Файл не найден")

    file_name, file_path, file_mime = row
    disk_path = UPLOAD_DIR / Path(file_path).name
    if not disk_path.is_file():
        raise HTTPException(status_code=404, detail="Файл не найден на сервере")

    download_name = file_name or disk_path.name
    encoded_name = quote(download_name)
    disp = "attachment" if disposition == "attachment" else "inline"
    return FileResponse(
        disk_path,
        media_type=file_mime or "application/octet-stream",
        headers={
            "Content-Disposition": f"{disp}; filename*=UTF-8''{encoded_name}",
        },
    )


@router.delete("/admin/leads/{lead_id}", dependencies=[Depends(require_admin)])
def delete_lead(lead_id: int) -> dict:
    with pool.connection() as conn:
        row = conn.execute(
            "SELECT file_path FROM leads WHERE id = %s",
            (lead_id,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Заявка не найдена")

        file_path = row[0]
        deleted = conn.execute(
            "DELETE FROM leads WHERE id = %s RETURNING id",
            (lead_id,),
        ).fetchone()
        if not deleted:
            raise HTTPException(status_code=404, detail="Заявка не найдена")

    if file_path:
        disk_path = UPLOAD_DIR / Path(file_path).name
        if disk_path.is_file():
            disk_path.unlink()

    return {"ok": True, "id": lead_id}
