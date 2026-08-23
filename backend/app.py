from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routers import documents, families, individuals
from shared.db import db_init

db_init()

MEDIA_DIR = Path(__file__).parent.resolve() / "media"
app = FastAPI()
app.include_router(individuals.router)
app.include_router(families.router)
app.include_router(documents.router)


app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")
