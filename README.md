
# AkhFlow

**A full-stack Islamic productivity dashboard designed to encourage consistency in daily worship and personal growth.**

AkhFlow helps users track their five daily prayers, log Quran reading progress, and monitor daily goals through a clean, responsive dashboard.

### [Live Demo — Try AkhFlow](https://akh-flow.vercel.app/)

Explore the interactive dashboard, mark prayers as completed, and log Quran reading progress directly in your browser.

**Note:** The live demo uses browser-based local storage and does not require a backend. The complete full-stack implementation using FastAPI, PostgreSQL, and Docker is available in this repository.

## Dashboard Preview

![AkhFlow Dashboard](screenshots/dashboard.png)

## Features

- **Daily Prayer Tracker:** Track completion of Fajr, Dhuhr, Asr, Maghrib, and Isha.
- **Quran Reading Tracker:** Log daily Quran pages and measure progress toward a reading goal.
- **Persistent Progress:** Save daily activity to PostgreSQL in the full-stack application or browser storage in the live demo.
- **Daily Dashboard:** View prayer completion, Quran pages, and daily progress statistics.
- **Responsive Interface:** A modern, dark-green dashboard designed for different screen sizes.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Database Driver | Psycopg |
| Development Infrastructure | Docker |
| Live Demo | Vercel, Browser localStorage |
| Version Control | Git, GitHub |

## Architecture

The full-stack application follows a three-tier architecture:

```text
React + TypeScript Frontend
           |
           | REST API (HTTP)
           v
      FastAPI Backend
           |
           | SQL via Psycopg
           v
     PostgreSQL Database
```

The frontend communicates with FastAPI through REST endpoints. FastAPI handles application logic and stores daily prayer and Quran activity records in PostgreSQL.

**Live Demo Architecture:**

```text
React + TypeScript Frontend
           |
           | Browser Storage
           v
        localStorage
```

The publicly deployed demo runs independently of the backend and saves each visitor's progress locally in their browser.

## Getting Started

Follow these instructions to run the complete full-stack application locally.

### Prerequisites

- Node.js and npm
- Python 3
- Docker Desktop
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/mostafaelamin/AkhFlow.git
cd AkhFlow
```

### 2. Start PostgreSQL

Make sure Docker Desktop is running.

Create and start the PostgreSQL container:

```bash
docker run --name akhflow-db \
  -e POSTGRES_USER=akhflow \
  -e POSTGRES_PASSWORD=akhflow_dev_password \
  -e POSTGRES_DB=akhflow \
  -p 127.0.0.1:5434:5432 \
  -v akhflow_pgdata:/var/lib/postgresql \
  -d postgres:18
```

This starts PostgreSQL in a Docker container and maps the database to local port `5434`.

If you have already created the container and it is stopped, restart it with:

```bash
docker start akhflow-db
```

### 3. Create Database Tables

Run the following command to initialize the database:

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

### 4. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory containing:

```env
DATABASE_URL=postgresql://akhflow:akhflow_dev_password@127.0.0.1:5434/akhflow
```

**Security Note:** These credentials are for local development only. Use strong, private credentials in any deployed environment. Never commit your `.env` file to GitHub.

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will be available at:

http://127.0.0.1:8000

Interactive API documentation:

http://127.0.0.1:8000/docs

### 5. Start the Frontend

Open a second terminal.

From the repository root, navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the application in your browser:

http://localhost:5173

The frontend will communicate with the locally running FastAPI backend.

## API Endpoints

The FastAPI backend exposes the following REST endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Check API status |
| GET | `/api/dashboard` | Retrieve dashboard configuration |
| GET | `/api/progress` | Retrieve daily prayer and Quran progress |
| PUT | `/api/prayers` | Save prayer completion |
| PUT | `/api/quran` | Save Quran reading progress |

## Deployment

An interactive frontend-only version of AkhFlow is publicly deployed using Vercel.

**Live Website:** https://akh-flow.vercel.app/

The live demo is maintained on the `frontend-demo` branch, while the `main` branch contains the original full-stack implementation.

### Live Demo Features

- Interactive five-prayer completion tracking
- Daily Quran page logging
- Automatic progress calculations
- Browser-based progress persistence
- Daily progress tracking based on the visitor's local date

The demo uses `localStorage`, so each visitor's progress is stored in their own browser rather than a shared database.

## Current Scope

AkhFlow is currently designed as a single-user productivity application.

The full-stack version runs locally and persists daily activity records in PostgreSQL. The publicly accessible frontend demo allows visitors to interact with the dashboard without configuring a backend or database.

The application does not currently include user authentication or a publicly hosted FastAPI backend.

## Future Improvements

- **Location-Based Prayer Times:** Display accurate prayer times based on the user's location.
- **Consistency Tracking:** Introduce prayer and Quran reading streaks.
- **Activity Analytics:** Visualize historical prayer completion and Quran reading trends.
- **Customizable Goals:** Allow users to set personalized daily Quran reading targets.
- **User Authentication:** Support individual accounts and personalized progress tracking.
- **Full-Stack Deployment:** Host the FastAPI backend and PostgreSQL database for a complete online experience.

## Author

**Mostafa Elamin**

GitHub: [mostafaelamin](https://github.com/mostafaelamin)
