
import os

import psycopg
from dotenv import load_dotenv

load_dotenv()

database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise RuntimeError("DATABASE_URL is missing from your .env file")

try:
    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            result = cursor.fetchone()

            print("Successfully connected to PostgreSQL!")
            print("Database version:", result[0])

except psycopg.Error as error:
    print("Database connection failed:", error)
