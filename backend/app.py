from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routers import documents, families, individuals, statistics
from shared.db import db_init

db_init()

BASE_DIR = Path(__file__).parent.resolve()
MEDIA_DIR = BASE_DIR / "media"
DIST_DIR = BASE_DIR.parent / "frontend-vite" / "dist"

app = FastAPI()
app.include_router(individuals.router)
app.include_router(families.router)
app.include_router(documents.router)
app.include_router(statistics.router)


app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

if DIST_DIR.is_dir():
    # Present only after `npm run build`; absent in dev, where the Vite
    # dev server serves the frontend and proxies /api and /media instead.
    app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="frontend")
