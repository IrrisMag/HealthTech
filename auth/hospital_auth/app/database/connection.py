import sqlite3
from contextlib import contextmanager
from app.config import settings


@contextmanager
def get_db():
    conn = sqlite3.connect(settings.DATABASE_URL)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
