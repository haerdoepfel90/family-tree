from fastapi import APIRouter
from shared.db import db_conn

router = APIRouter(
    prefix="/api/v1/statistics",
    tags=["statistics"]
)

@router.get("")
def get_statistics():
    with db_conn() as con:
        n_individuals = con.execute("SELECT COUNT(id) FROM individuals;").fetchone()[0]
        n_families = con.execute("SELECT COUNT(id) FROM families;").fetchone()[0]
        n_documents = con.execute("SELECT COUNT(id) FROM documents;").fetchone()[0]

    return {
        "counts": {
            "individuals": n_individuals,
            "families": n_families,
            "documents": n_documents,
        }
    }