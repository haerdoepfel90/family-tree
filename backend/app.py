from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from typing import Annotated
from pathlib import Path
import shutil

from data.models import Family, FamilyPatch, Individual, IndividualPatch
from shared.db import db_conn, db_init

db_init()

MEDIA_DIR = Path(__file__).parent.resolve() / "media"
PORTRAIT_DIR = MEDIA_DIR / "portraits"
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
            f"SELECT * FROM individuals WHERE id={individual_id};"
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
            f"""
            DELETE FROM individuals WHERE id={individual_id};"""
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


@app.get("/api/v1/tree")
def get_tree():
    with db_conn() as con:
        individuals = con.execute(
            "SELECT * FROM individuals ORDER BY birth_date"
        ).fetchall()
        families = con.execute("SELECT * FROM families").fetchall()
        family_children = con.execute("SELECT * FROM family_children").fetchall()

    elements = []

    for person in individuals:
        name = " ".join(filter(None, [person["given_name"], person["surname"]]))
        if person["maiden_name"]:
            name += f" ({person['maiden_name']})"
        if person["birth_date"]:
            name += f"\n{person['birth_date'][:4]}"

        elements.append(
            {
                "data": {
                    "id": f"i{person['id']}",
                    "label": name,
                }
            }
        )

    for family in families:
        fid = f"f{family['id']}"
        elements.append({"data": {"id": fid, "invisible": "yes"}})

        for partner_id in (family["partner1_id"], family["partner2_id"]):
            if partner_id is not None:
                elements.append(
                    {
                        "data": {
                            "id": f"i{partner_id}->{fid}",
                            "source": f"i{partner_id}",
                            "target": fid,
                            "relationship": "partner",
                        }
                    }
                )

    for link in family_children:
        elements.append(
            {
                "data": {
                    "id": f"f{link['family_id']}->i{link['child_id']}",
                    "source": f"f{link['family_id']}",
                    "target": f"i{link['child_id']}",
                    "relationship": "child",
                }
            }
        )

    return elements


@app.get("/api/v1/tree/individual/{individual_id}/immediate")
def get_immediate_family(individual_id: int):
    with db_conn() as con:
        individual = con.execute(
            "SELECT * FROM individuals WHERE id=?;", (individual_id,)
        ).fetchone()
        family_as_child_row = con.execute(
            "SELECT family_id FROM family_children WHERE child_id=?;", (individual_id,)
        ).fetchone()
        family_as_parent_row = con.execute(
            "SELECT id FROM families WHERE partner1_id=? OR partner2_id=?;",
            (individual_id, individual_id),
        ).fetchone()

        family_as_child_id = (
            family_as_child_row["family_id"] if family_as_child_row else None
        )
        family_as_parent_id = (
            family_as_parent_row["id"] if family_as_child_row else None
        )

        parents = []
        siblings = []  # initialize empty lists to prevent missing error
        children = []
        spouses = []

        if family_as_child_id is not None:
            fam = con.execute(
                "SELECT partner1_id, partner2_id FROM families WHERE id=?;",
                (family_as_child_id,),
            ).fetchone()

            parents = [pid for pid in (fam["partner1_id"], fam["partner2_id"]) if pid]

        sibs = con.execute(
            "SELECT child_id FROM family_children WHERE family_id=? AND child_id !=?;",
            (
                family_as_child_id,
                individual_id,
            ),
        ).fetchall()
        siblings = [row["child_id"] for row in sibs]

        sps = con.execute(
            "SELECT partner1_id, partner2_id FROM families WHERE id = ?;",
            (family_as_parent_id,),
        ).fetchone()

        spouses = []
        if sps:
            spouse_id = (
                sps["partner2_id"]
                if sps["partner1_id"] == individual_id
                else sps["partner1_id"]
            )
            if spouse_id:
                spouses.append(spouse_id)

        childs = con.execute(
            "SELECT child_id FROM family_children WHERE family_id=?;",
            (family_as_parent_id,),
        ).fetchall()
        children = [row["child_id"] for row in childs]

        elements = []

        for i, child in enumerate(children):
            elements.append(
                {
                    "id": f"i{child}",
                    "position": {"x": i * 300, "y": 0},
                    "data": {"label": "child"},
                    "type": "output",
                }
            )

        elements.append(
            {
                "id": f"i{individual_id}",
                "position": {"x": len(children) * 300 / 2 - 150, "y": 50},
                "data": {"label": "individual"},
                "type": "input",
            }
        )

        print(elements)


app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
