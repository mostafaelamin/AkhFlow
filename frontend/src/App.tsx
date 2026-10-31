
import { useEffect, useState } from "react";
import "./App.css";

type DashboardData = {
  greeting: string;
  message: string;
  prayers: string[];
  quran_goal: number;
};

type ProgressData = {
  activity_date: string;
  completed_prayers: string[];
  pages_read: number;
};

const dashboard: DashboardData = {
  greeting: "Assalamu Alaikum",
  message: "Make every day meaningful.",
  prayers: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"],
  quran_goal: 5,
};

function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStorageKey(date: string): string {
  return `akhflow-demo-${date}`;
}

function readProgress(date: string): ProgressData {
  const fallback: ProgressData = {
    activity_date: date,
    completed_prayers: [],
    pages_read: 0,
  };

  try {
    const saved = localStorage.getItem(getStorageKey(date));
    if (!saved) return fallback;

    const parsed = JSON.parse(saved);

    return {
      activity_date: date,
      completed_prayers: Array.isArray(parsed.completed_prayers)
        ? parsed.completed_prayers.filter(
            (prayer: unknown) =>
              typeof prayer === "string" &&
              dashboard.prayers.includes(prayer)
          )
        : [],
      pages_read:
        typeof parsed.pages_read === "number" &&
        Number.isFinite(parsed.pages_read)
          ? Math.max(0, parsed.pages_read)
          : 0,
    };
  } catch {
    return fallback;
  }
}

function App() {
  const [activityDate, setActivityDate] = useState(getTodayDate);
  const [completedPrayers, setCompletedPrayers] = useState<string[]>(
    () => readProgress(getTodayDate()).completed_prayers
  );
  const [pagesRead, setPagesRead] = useState<number>(
    () => readProgress(getTodayDate()).pages_read
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      const today = getTodayDate();
      if (today !== activityDate) {
        setActivityDate(today);
        const saved = readProgress(today);
        setCompletedPrayers(saved.completed_prayers);
        setPagesRead(saved.pages_read);
      }
    }, 30000);

    return () => window.clearInterval(interval);
  }, [activityDate]);

  function saveProgress(prayers: string[], pages: number) {
    const progress: ProgressData = {
      activity_date: activityDate,
      completed_prayers: prayers,
      pages_read: pages,
    };

    try {
      localStorage.setItem(
        getStorageKey(activityDate),
        JSON.stringify(progress)
      );
    } catch {
      // The dashboard remains interactive if browser storage is unavailable.
    }
  }

  function togglePrayer(prayer: string) {
    const nextCompleted = completedPrayers.includes(prayer)
      ? completedPrayers.filter((item) => item !== prayer)
      : [...completedPrayers, prayer];

    setCompletedPrayers(nextCompleted);
    saveProgress(nextCompleted, pagesRead);
  }

  function updateQuran(change: number) {
    const nextPages = Math.max(0, pagesRead + change);

    setPagesRead(nextPages);
    saveProgress(completedPrayers, nextPages);
  }

  const prayers = dashboard.prayers;

  const progress = Math.round(
    (completedPrayers.length / prayers.length) * 100
  );

  const quranGoal = dashboard.quran_goal;

  const quranProgress = Math.min(
    100,
    Math.round((pagesRead / quranGoal) * 100)
  );

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">☪</div>
          <div>
            <h2>AkhFlow</h2>
            <p>Your day, with intention.</p>
          </div>
        </div>

        <div className="sidebar-section">WORKSPACE</div>

        <nav className="navigation">
          <a className="nav-item active" href="#dashboard">
            Dashboard
          </a>
          <a className="nav-item" href="#prayers">
            Prayer Tracker
          </a>
          <a className="nav-item" href="#quran">
            Quran Goals
          </a>
        </nav>

        <div className="sidebar-footer">
          <p>Built with purpose.</p>
          <span>Developed by Mostafa Elamin</span>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <span>PERSONAL DASHBOARD</span>
          <span className="topbar-date">
            {new Date(`${activityDate}T12:00:00`).toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                month: "long",
                day: "numeric",
              }
            )}
          </span>
        </header>

        <section className="welcome-section">
          <p className="eyebrow">
            {dashboard.greeting.toUpperCase()}
          </p>

          <h1>{dashboard.message}</h1>

          <p>
            Stay connected to your daily prayers, Quran reading, and
            personal goals.
          </p>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">PRAYERS COMPLETED</span>
            <h2>
              {completedPrayers.length}
              <span> / {prayers.length}</span>
            </h2>
            <p>Today's salah progress</p>
          </div>

          <div className="stat-card">
            <span className="stat-label">QURAN READING</span>
            <h2>
              {pagesRead}
              <span> pages</span>
            </h2>
            <p>Pages read today</p>
          </div>

          <div className="stat-card">
            <span className="stat-label">DAILY PROGRESS</span>
            <h2>
              {progress}
              <span>%</span>
            </h2>

            <div className="progress-bar">
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel" id="prayers">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">DAILY WORSHIP</span>
                <h2>Prayer Tracker</h2>
              </div>

              <span className="panel-tag">5 daily prayers</span>
            </div>

            <p className="panel-description">
              Mark each prayer as completed throughout your day.
            </p>

            <div className="prayer-list">
              {prayers.map((prayer, index) => {
                const completed = completedPrayers.includes(prayer);

                return (
                  <button
                    key={prayer}
                    type="button"
                    className={`prayer-row ${
                      completed ? "completed" : ""
                    }`}
                    onClick={() => togglePrayer(prayer)}
                    aria-pressed={completed}
                  >
                    <div className="prayer-info">
                      <span className="prayer-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{prayer}</span>
                    </div>

                    <span className="prayer-status">
                      {completed ? "✓ Completed" : "Mark complete"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="panel" id="quran">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">PERSONAL GROWTH</span>
                <h2>Quran Goals</h2>
              </div>
            </div>

            <p className="panel-description">
              Small, consistent steps toward your reading goals.
            </p>

            <div className="quran-highlight">
              <span>YOUR READING PROGRESS</span>
              <h3>{pagesRead} pages</h3>
              <p>Daily goal: {quranGoal} pages</p>

              <div className="progress-bar">
                <div style={{ width: `${quranProgress}%` }} />
              </div>
            </div>

            <div className="quran-actions">
              <button
                type="button"
                onClick={() => updateQuran(1)}
              >
                + Log a page
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => updateQuran(-1)}
                disabled={pagesRead === 0}
              >
                Undo page
              </button>
            </div>

            <p className="helper-text" aria-live="polite">
              Your demo progress is saved automatically in this browser.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
