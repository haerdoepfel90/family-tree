import shutil
from pathlib import Path

from data.models import Individual, IndividualPatch
from fastapi import APIRouter, UploadFile
from shared.db import db_conn

MEDIA_DIR = Path(__file__).parent.parent.resolve() / "media"
PORTRAIT_DIR = MEDIA_DIR / "portraits"

router = APIRouter(
    prefix="/api/v1/individuals",
    tags=["individuals"],
)


@router.post("")
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


@router.post("/{individual_id}/portrait")
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


@router.get("/{individual_id}/portrait")
async def get_portrait(individual_id: int):
    return


@router.get("")
def get_individuals():

    with db_conn() as con:
        peoples = con.execute(
            "SELECT * FROM individuals ORDER BY birth_date, given_name;"
        ).fetchall()

    return [dict(person) for person in peoples]


@router.get("/{individual_id}")
def get_individual(individual_id: int):

    with db_conn() as con:
        person = con.execute(
            "SELECT * FROM individuals WHERE id=?;", (individual_id,)
        ).fetchone()

    return dict(person)


@router.patch("/{individual_id}")
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


@router.delete("/{individual_id}")
def delete_individual(individual_id: int):
    with db_conn() as con:
        con.execute(
            """
            DELETE FROM individuals WHERE id=?;""",
            (individual_id,),
        )
        con.commit()
    return {"ok": True, "id": individual_id}


@router.get("/{individual_id}/documents")
def get_individual_documents(individual_id: int):
    with db_conn() as con:
        docs = con.execute(
            """
            SELECT d.*, dl.role
            FROM documents d
            JOIN document_links dl ON dl.document_id = d.id
            WHERE dl.subject_type = 'individual'
                AND dl.subject_id = ?
            ORDER BY d.date;
            """,
            (individual_id,),
        ).fetchall()

    return [dict(doc) for doc in docs]
