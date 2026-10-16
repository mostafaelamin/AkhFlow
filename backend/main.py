
import os
from datetime import date

import psycopg
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing from .env")

app = FastAPI(title="AkhFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["*"],
)

PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]


class PrayerUpdate(BaseModel):
    prayer_name: str
    completed: bool
    activity_date: date


class QuranUpdate(BaseModel):
    pages_read: int = Field(ge=0)
    activity_date: date


def get_connection():
    return psycopg.connect(DATABASE_URL)


@app.get("/")
def home():
    return {"message": "Welcome to the AkhFlow API!"}


@app.get("/api/health")
def health():
    return {"status": "ok", "application": "AkhFlow"}


@app.get("/api/dashboard")
def get_dashboard():
    return {
        "greeting": "Assalamu Alaikum",
        "message": "Build consistency, one day at a time.",
        "prayers": PRAYERS,
        "quran_goal": 5,
    }


@app.get("/api/progress")
def get_progress(activity_date: date):
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT prayer_name
                    FROM prayer_logs
                    WHERE prayer_date = %s AND completed = TRUE
                    """,
                    (activity_date,),
                )

                completed_prayers = [
                    row[0] for row in cursor.fetchall()
                ]

                cursor.execute(
                    """
                    SELECT pages_read
                    FROM quran_logs
                    WHERE reading_date = %s
                    """,
                    (activity_date,),
                )

                result = cursor.fetchone()
                pages_read = result[0] if result else 0

        return {
            "activity_date": activity_date,
            "completed_prayers": completed_prayers,
            "pages_read": pages_read,
        }

    except psycopg.Error:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve progress from the database",
        )


@app.put("/api/prayers")
def update_prayer(data: PrayerUpdate):
    if data.prayer_name not in PRAYERS:
        raise HTTPException(
            status_code=400,
            detail="Invalid prayer name",
        )

    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO prayer_logs
                        (prayer_name, prayer_date, completed)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (prayer_name, prayer_date)
                    DO UPDATE SET completed = EXCLUDED.completed
                    """,
                    (
                        data.prayer_name,
                        data.activity_date,
                        data.completed,
                    ),
                )

        return {"message": "Prayer progress saved"}

    except psycopg.Error:
        raise HTTPException(
            status_code=503,
            detail="Unable to save prayer progress",
        )


@app.put("/api/quran")
def update_quran(data: QuranUpdate):
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO quran_logs
                        (reading_date, pages_read)
                    VALUES (%s, %s)
                    ON CONFLICT (reading_date)
                    DO UPDATE SET pages_read = EXCLUDED.pages_read
                    """,
                    (data.activity_date, data.pages_read),
                )

        return {"message": "Quran progress saved"}

    except psycopg.Error:
        raise HTTPException(
            status_code=503,
            detail="Unable to save Quran progress",
        )
