import shutil
import time
import uuid
from pathlib import Path

from data.models import DocumentLink, DocumentPatch
from fastapi import APIRouter, UploadFile
from shared.db import db_conn

MEDIA_DIR = Path(__file__).parent.resolve() / "media"
DOCUMENT_DIR = MEDIA_DIR / "documents"

router = APIRouter(
    prefix="/api/v1/documents",
    tags=["documents"],
)


@router.post("")
async def upload_document(file: UploadFile):
    ext = Path(file.filename).suffix.lower()

    file_uuid = str(uuid.uuid4())

    filename = f"{file_uuid}{ext}"

    uploaded_at = time.time()

    DESTINATION = DOCUMENT_DIR / filename

    with DESTINATION.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    with db_conn() as con:
        cursor = con.execute(
            """
            INSERT INTO documents (uuid, ext, uploaded_at) VALUES (?,?,?);""",
            (
                file_uuid,
                ext,
                uploaded_at,
            ),
        )
        con.commit()
        doc_id = cursor.lastrowid
    return {
        "ok": True,
        "id": doc_id,
    }


@router.patch("/{document_id}")
def edit_document(doc: DocumentPatch, document_id: int):
    fields = doc.model_dump(exclude_unset=True)
    print(fields)

    with db_conn() as con:
        if fields:
            patched_cols = ", ".join(f"{key} = ?" for key in fields)
            values = list(fields.values()) + [document_id]

            print(values)

            con.execute(
                f"""
                UPDATE documents SET {patched_cols} WHERE id=?""",
                values,
            )
            con.commit()

    return {"ok": True}


@router.post("/{id}/links")
def link_document(link: DocumentLink, id: int):
    with db_conn() as con:
        con.execute(
            """
            INSERT INTO document_links (document_id, subject_type, subject_id, role) VALUES (?,?,?,?)""",
            (
                id,
                link.subject_type,
                link.subject_id,
                link.role,
            ),
        )
    return {"ok": True}


@router.delete("/{document_id}")
def delete_document(document_id: int):
    with db_conn() as con:
        con.execute(
            """
            DELETE FROM documents WHERE id=?;""",
            (document_id,),
        )

    return {"ok": True}


@router.get("/{document_id}")
def get_document(document_id: int):
    with db_conn() as con:
        doc = con.execute(
            """
            SELECT * FROM documents WHERE id=?""",
            (document_id),
        ).fetchone()

        links = con.execute(
            """
            SELECT * FROM document_links WHERE document_id = ?;""",
            (document_id),
        ).fetchall()

        out = dict(doc)
        out["links"] = [dict(link) for link in links]

        return out


@router.delete("/{document_id}/links")
def unlink_document(document_id: int, link: DocumentLink):
    with db_conn() as con:
        con.execute(
            """
            DELETE FROM document_links
            WHERE document_id = ? AND subject_type = ? AND subject_id = ?
            """,
            (document_id, link.subject_type, link.subject_id),
        )
        con.commit()
    return {"ok": True}
