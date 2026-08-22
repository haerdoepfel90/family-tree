import sqlite3

from shared.paths import DB_PATH, DB_SCHEMA


def db_conn():
    con = sqlite3.Connection(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA journal_mode=WAL;")
    con.execute("PRAGMA foreign_keys=ON;")
    con.execute("PRAGMA busy_timeout=5000;")
    con.execute("PRAGMA synchronous=normal;")
    return con


def db_init():
    with db_conn() as con, open(DB_SCHEMA) as schema:
        con.executescript(schema.read())
