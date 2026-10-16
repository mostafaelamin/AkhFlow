
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

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

// Use the local date rather than UTC so progress is
// recorded under the correct day on your computer.
function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function App() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [apiError, setApiError] = useState("");
  const [completedPrayers, setCompletedPrayers] = useState<string[]>([]);
  const [pagesRead, setPagesRead] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activityDate, setActivityDate] = useState(getTodayDate);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setApiError("");

      try {
        const [dashboardResponse, progressResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/dashboard`),
            fetch(
              `${API_URL}/api/progress?activity_date=${activityDate}`
            ),
          ]);

        if (!dashboardResponse.ok || !progressResponse.ok) {
          throw new Error("Unable to load dashboard data");
        }

        const dashboardData: DashboardData =
          await dashboardResponse.json();

        const progressData: ProgressData =
          await progressResponse.json();

        if (!cancelled) {
          setDashboard(dashboardData);
          setCompletedPrayers(progressData.completed_prayers);
          setPagesRead(progressData.pages_read);
        }
      } catch {
        if (!cancelled) {
          setApiError(
            "Unable to load your progress. Check that FastAPI and PostgreSQL are running."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [activityDate]);

  // Check for a new local day while the dashboard is open.
  useEffect(() => {
    const interval = window.setInterval(() => {
      const today = getTodayDate();

      if (today !== activityDate && !saving) {
        setActivityDate(today);
      }
    }, 30000);

    return () => window.clearInterval(interval);
  }, [activityDate, saving]);

  async function togglePrayer(prayer: string) {
    if (saving || loading || apiError) return;

    const nextCompleted = !completedPrayers.includes(prayer);

    setSaving(true);
    setApiError("");

    try {
      const response = await fetch(`${API_URL}/api/prayers`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prayer_name: prayer,
          completed: nextCompleted,
          activity_date: activityDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save prayer");
      }

      setCompletedPrayers((previous) =>
        nextCompleted
          ? [...previous, prayer]
          : previous.filter((item) => item !== prayer)
      );
    } catch {
      setApiError(
        "Unable to save your prayer. Please check your database connection and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateQuran(change: number) {
    if (saving || loading || apiError) return;

    const nextPages = Math.max(0, pagesRead + change);

    if (nextPages === pagesRead) return;

    setSaving(true);
    setApiError("");

    try {
      const response = await fetch(`${API_URL}/api/quran`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pages_read: nextPages,
          activity_date: activityDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save Quran progress");
      }

      setPagesRead(nextPages);
    } catch {
      setApiError(
        "Unable to save your Quran progress. Please check your database connection and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const prayers = dashboard?.prayers ?? [];

  const progress =
    prayers.length > 0
      ? Math.round(
          (completedPrayers.length / prayers.length) * 100
        )
      : 0;

  const quranGoal = dashboard?.quran_goal ?? 5;

  const quranProgress = Math.min(
    100,
    Math.round((pagesRead / quranGoal) * 100)
  );

  const controlsDisabled = loading || saving || Boolean(apiError);

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

        {apiError && (
          <div role="alert" className="helper-text">
            <p>{apiError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Retry connection
            </button>
          </div>
        )}

        <section className="welcome-section">
          <p className="eyebrow">
            {dashboard?.greeting.toUpperCase() ?? "LOADING..."}
          </p>

          <h1>
            {dashboard?.message ?? "Loading your dashboard..."}
          </h1>

          <p>
            Stay connected to your daily prayers, Quran reading, and
            personal goals.
          </p>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">PRAYERS COMPLETED</span>
            <h2>
              {loading ? "..." : completedPrayers.length}
              <span> / {prayers.length}</span>
            </h2>
            <p>Today's salah progress</p>
          </div>

          <div className="stat-card">
            <span className="stat-label">QURAN READING</span>
            <h2>
              {loading ? "..." : pagesRead}
              <span> pages</span>
            </h2>
            <p>Pages read today</p>
          </div>

          <div className="stat-card">
            <span className="stat-label">DAILY PROGRESS</span>
            <h2>
              {loading ? "..." : progress}
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
                    disabled={controlsDisabled}
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
              <h3>{loading ? "Loading..." : `${pagesRead} pages`}</h3>
              <p>Daily goal: {quranGoal} pages</p>

              <div className="progress-bar">
                <div style={{ width: `${quranProgress}%` }} />
              </div>
            </div>

            <div className="quran-actions">
              <button
                type="button"
                onClick={() => updateQuran(1)}
                disabled={controlsDisabled}
              >
                + Log a page
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => updateQuran(-1)}
                disabled={controlsDisabled || pagesRead === 0}
              >
                Undo page
              </button>
            </div>

            <p className="helper-text" aria-live="polite">
              {loading
                ? "Loading your saved progress..."
                : saving
                ? "Saving your progress..."
                : apiError
                ? "Your latest change could not be saved."
                : "Your progress is saved automatically to PostgreSQL."}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
