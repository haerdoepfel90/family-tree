from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BACKEND_DIR / "data" / "familytree.db"
DB_SCHEMA = BACKEND_DIR / "shared" / "schema.sql"
