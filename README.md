
# AkhFlow

**A full-stack Islamic productivity dashboard built to encourage consistency in daily worship and personal growth.**

AkhFlow helps users track their five daily prayers and Quran reading progress through a clean, responsive dashboard.

## Features

- **Daily Prayer Tracker:** Track completion of Fajr, Dhuhr, Asr, Maghrib, and Isha.
- **Quran Reading Tracker:** Log daily Quran pages and measure progress toward a reading goal.
- **Persistent Progress:** Save activity to PostgreSQL and restore it after refreshing the application.
- **Daily Dashboard:** View prayer completion, Quran pages, and daily progress statistics.
- **Responsive Interface:** A modern, dark-green dashboard designed for different screen sizes.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Database Driver | Psycopg |
| Development Infrastructure | Docker |
| Version Control | Git, GitHub |

## Architecture

React Frontend
      |
      | HTTP Requests
      v
FastAPI Backend
      |
      | SQL Queries
      v
PostgreSQL Database

The frontend communicates with FastAPI through REST endpoints. FastAPI handles application logic and stores daily activity records in PostgreSQL.

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3
- Docker Desktop

### 1. Clone the repository

```bash
git clone https://github.com/mostafaelamin/AkhFlow.git
cd AkhFlow
```

### 2. Start PostgreSQL

```bash
docker run --name akhflow-db \
  -e POSTGRES_USER=akhflow \
  -e POSTGRES_PASSWORD=akhflow_dev_password \
  -e POSTGRES_DB=akhflow \
  -p 127.0.0.1:5434:5432 \
  -v akhflow_pgdata:/var/lib/postgresql \
  -d postgres:18
```

### 3. Create database tables

```bash
docker exec -i akhflow-db psql -U akhflow -d akhflow <<'SQL'
CREATE TABLE IF NOT EXISTS prayer_logs (
    id SERIAL PRIMARY KEY,
    prayer_name VARCHAR(20) NOT NULL
        CHECK (prayer_name IN ('Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha')),
    prayer_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (prayer_name, prayer_date)
);

CREATE TABLE IF NOT EXISTS quran_logs (
    id SERIAL PRIMARY KEY,
    reading_date DATE NOT NULL UNIQUE,
    pages_read INTEGER NOT NULL DEFAULT 0
        CHECK (pages_read >= 0)
);
SQL
```

### 4. Configure the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi "uvicorn[standard]" "psycopg[binary]" python-dotenv
```

Create a `backend/.env` file containing:

```env
DATABASE_URL=postgresql://akhflow:akhflow_dev_password@127.0.0.1:5434/akhflow
```

This is a local development example. Use a strong, private password for any deployed environment.

Start the API:

```bash
uvicorn main:app --reload
```

The API will be available at http://127.0.0.1:8000.

Interactive API documentation is available at http://127.0.0.1:8000/docs.

### 5. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173 to open AkhFlow.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Check API status |
| GET | /api/dashboard | Retrieve dashboard configuration |
| GET | /api/progress | Retrieve daily prayer and Quran progress |
| PUT | /api/prayers | Save prayer completion |
| PUT | /api/quran | Save Quran reading progress |

## Current Scope

AkhFlow is currently a single-user local application. It does not yet include user authentication or hosted deployment.

## Future Improvements

- Prayer times based on location
- Prayer and Quran streak tracking
- Historical activity analytics
- Customizable Quran reading goals
- User authentication

## Author

**Mostafa Elamin**

GitHub: https://github.com/mostafaelamin
