from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

DB_PATH = Path(PROJECT_ROOT / "data" / "familytree.db").resolve()

DB_SCHEMA = Path(PROJECT_ROOT / "shared" / "schema.sql").resolve()
