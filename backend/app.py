import shutil
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from data.models import (
    DocumentLink,
    DocumentPatch,
    Family,
    FamilyPatch,
    Individual,
    IndividualPatch,
)
from shared.db import db_conn, db_init

db_init()

MEDIA_DIR = Path(__file__).parent.resolve() / "media"
PORTRAIT_DIR = MEDIA_DIR / "portraits"
DOCUMENT_DIR = MEDIA_DIR / "documents"
app = FastAPI()


@app.get("/manage")
def manage_page():
    return FileResponse("frontend/manage.html")


@app.post("/api/v1/individuals/create")
def create_individual(individual: Individual):
    with db_conn() as con:
        cursor = con.execute(
            """
            INSERT INTO individuals(
                given_name,
                second_name,
                third_name,
                surname,
                maiden_name,
                sex,
                birth_date,
                birth_place,
                death_date,
                death_place) VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (
                individual.given_name,
                individual.second_name,
                individual.third_name,
                individual.surname,
                individual.maiden_name,
                individual.sex,
                individual.birth_date,
                individual.birth_place,
                individual.death_date,
                individual.death_place,
            ),
        )
        return {"ok": True, "id": cursor.lastrowid}


@app.post("/api/v1/individuals/{individual_id}/portrait")
async def upload_portrait(individual_id: int, file: UploadFile):
    ext = Path(file.filename).suffix.lower()
    print(ext)

    filename = f"{individual_id}_portrait{ext}"
    print(filename)

    DESTINATION = PORTRAIT_DIR / filename
    print(DESTINATION)
    with DESTINATION.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    portrait_url = f"/media/portraits/{filename}"
    print(portrait_url)

    with db_conn() as con:
        con.execute(
            "UPDATE individuals SET portrait_url = ? WHERE id = ?",
            (
                portrait_url,
                individual_id,
            ),
        )

    return {"ok": True}


@app.get("/api/v1/individuals/{individual_id}/portrait")
async def get_portrait(individual_id: int):
    return


@app.get("/api/v1/individuals")
def get_individuals():

    with db_conn() as con:
        peoples = con.execute(
            "SELECT * FROM individuals ORDER BY birth_date, given_name;"
        ).fetchall()

    return [dict(person) for person in peoples]


@app.get("/api/v1/individuals/{individual_id}")
def get_individual(individual_id: int):

    with db_conn() as con:
        person = con.execute(
            "SELECT * FROM individuals WHERE id=?;", (individual_id,)
        ).fetchone()

    return dict(person)


@app.patch("/api/v1/individuals/{individual_id}")
def patch_individual(individual_id: int, patch: IndividualPatch):
    fields = patch.model_dump(exclude_unset=True)

    patched_cols = " ,".join(f"{key} = ?" for key in fields)
    values = list(fields.values()) + [individual_id]
    print(values)

    with db_conn() as con:
        con.execute(
            f"""
            UPDATE individuals SET {patched_cols} WHERE id = ?""",
            values,
        )
        con.commit()

    return {"ok": True}


@app.delete("/api/v1/individuals/{individual_id}")
def delete_individual(individual_id: int):
    with db_conn() as con:
        con.execute(
            """
            DELETE FROM individuals WHERE id=?;""",
            (individual_id,),
        )
        con.commit()
    return {"ok": True, "id": individual_id}


@app.post("/api/v1/families/create")
def create_family(family: Family):
    with db_conn() as con:
        cursor = con.execute(
            """
            INSERT INTO families(
                partner1_id,
                partner2_id,
                wedding_date
                ) VALUES (?,?,?)""",
            (
                family.partner_1,
                family.partner_2,
                family.wedding_date,
            ),
        )
        return {"ok": True, "id": cursor.lastrowid}


@app.post("/api/v1/families/{family_id}/children/{child_id}")
def link_children_to_family(family_id: int, child_id: int):
    with db_conn() as con:
        con.execute(
            """
            INSERT OR IGNORE INTO family_children(
                family_id,
                child_id) VALUES (?,?)""",
            (
                family_id,
                child_id,
            ),
        )
        return {"ok": True}


@app.patch("/api/v1/families/{family_id}")
def patch_family(family_id: int, patch: FamilyPatch):
    fields = patch.model_dump(exclude_unset=True, exclude={"children_list"})
    column_names = {"partner_1": "partner1_id", "partner_2": "partner2_id"}

    with db_conn() as con:
        if fields:
            patched_cols = " ,".join(
                f"{column_names.get(key, key)} = ?" for key in fields
            )
            values = list(fields.values()) + [family_id]

            con.execute(
                f"""
                UPDATE families SET {patched_cols} WHERE id = ?""",
                values,
            )

        if patch.children_list is not None:
            con.execute(
                "DELETE FROM family_children WHERE family_id = ?;",
                (family_id,),
            )

            for child in patch.children_list:
                con.execute(
                    """
                    INSERT INTO family_children (family_id, child_id) VALUES (?,?);""",
                    (
                        family_id,
                        child,
                    ),
                )

    return {"ok": True}


@app.get("/api/v1/families/{family_id}")
def get_family(family_id: int):
    with db_conn() as con:
        family = con.execute(
            "SELECT * FROM families WHERE id = ?;", (family_id,)
        ).fetchone()
        children_rows = con.execute(
            "SELECT child_id FROM family_children WHERE family_id = ?;",
            (family_id,),
        ).fetchall()

    return {
        "id": family["id"],
        "partner1_id": family["partner1_id"],
        "partner2_id": family["partner2_id"],
        "wedding_date": family["wedding_date"],
        "children": [c["child_id"] for c in children_rows],
    }


@app.get("/api/v1/families")
def get_families():
    with db_conn() as con:
        families_data = con.execute("SELECT * FROM families;").fetchall()
        children_rows = con.execute("""
            SELECT fc.family_id, fc.child_id
            FROM family_children fc
            JOIN individuals i ON i.id = fc.child_id
            ORDER BY i.birth_date;""").fetchall()

    families = []
    for family in families_data:
        families.append(
            {
                "id": family["id"],
                "partner1_id": family["partner1_id"],
                "partner2_id": family["partner2_id"],
                "wedding_date": family["wedding_date"],
                "children": [
                    c["child_id"]
                    for c in children_rows
                    if c["family_id"] == family["id"]
                ],
            }
        )
    return families


@app.post("/api/v1/documents")
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


@app.patch("/api/v1/documents/{document_id}")
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


@app.post("/api/v1/documents/{id}/links")
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


@app.delete("/api/v1/documents/{document_id}")
def delete_document(document_id: int):
    with db_conn() as con:
        con.execute(
            """
            DELETE FROM documents WHERE id=?;""",
            (document_id,),
        )

    return {"ok": True}


@app.get("/api/v1/documents/{document_id}")
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


@app.delete("/api/v1/documents/{document_id}/links")
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


app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")
