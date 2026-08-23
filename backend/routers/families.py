from data.models import Family, FamilyPatch
from fastapi import APIRouter
from shared.db import db_conn

router = APIRouter(
    prefix="/api/v1/families",
    tags=["families"],
)


@router.post("")
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


@router.post("/{family_id}/children/{child_id}")
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


@router.patch("/{family_id}")
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


@router.get("/{family_id}")
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


@router.get("")
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
