import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";

import homeHeroImage from "@/assets/clinician-hub-welcome-landscape.png";
import { SessionBanner } from "@/components/SessionBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/contexts/SessionContext";
import { api } from "@/lib/api";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SESSION_TONES = ["purple", "blue", "pink", "mint"];

function createPreviewSessions(referenceDate) {
  const session = (id, dayOffset, hour, minute, patientLabel, name) => {
    const date = new Date(referenceDate);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, minute, 0, 0);
    return {
      session_id: `preview-session-${id}`,
      created_at: date.toISOString(),
      patient_label: patientLabel,
      name,
      isPreview: true,
    };
  };

  return [
    session(1, 0, 9, 0, "Alex R.", "Word finding"),
    session(2, 0, 10, 30, "Jordan M.", "Functional communication"),
    session(3, 0, 12, 0, "Taylor K.", "Reading comprehension"),
    session(4, 0, 14, 0, "Sam P.", "Cognitive practice"),
    session(5, -3, 11, 0, "Morgan L.", "Voice therapy"),
    session(6, 2, 9, 30, "Casey N.", "Motor speech"),
    session(7, 5, 13, 30, "Jamie D.", "Dysphagia education"),
    session(8, 10, 15, 0, "Riley S.", "Real-world communication"),
  ];
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function getSessionDate(session) {
  const value = session?.started_at || session?.created_at;
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getCalendarDays(month) {
  const first = startOfMonth(month);
  const mondayOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date,
      day: date.getDate(),
      muted: date.getMonth() !== month.getMonth(),
    };
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Good evening";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Good night";
}

function formatSessionTime(session) {
  const date = getSessionDate(session);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getSessionLabel(session) {
  return session.patient_label || session.name || "Saved session";
}

function getSessionSubtitle(session) {
  const activities = session.summary?.totals?.activities_count;
  if (activities) return `${activities} ${activities === 1 ? "activity" : "activities"}`;
  return session.name && session.patient_label ? session.name : "Therapy session";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isActive } = useSession();
  const [sessions, setSessions] = useState([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const today = useMemo(() => new Date(), []);
  const firstName = user?.name?.split(/\s+/).filter(Boolean)[0] || "Guest Clinician";
  const previewSessionsEnabled = process.env.NODE_ENV !== "production"
    && new URLSearchParams(window.location.search).get("previewSessions") === "1";

  useEffect(() => {
    let active = true;
    api.get("/sessions")
      .then(({ data }) => {
        if (active) setSessions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setSessions([]);
      })
      .finally(() => {
        if (active) setSessionsLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const displayedSessions = useMemo(
    () => (previewSessionsEnabled ? createPreviewSessions(today) : sessions),
    [previewSessionsEnabled, sessions, today],
  );

  const datedSessions = useMemo(
    () => displayedSessions
      .map((session, index) => ({
        session,
        date: getSessionDate(session),
        tone: SESSION_TONES[index % SESSION_TONES.length],
      }))
      .filter((item) => item.date)
      .sort((left, right) => left.date - right.date),
    [displayedSessions],
  );

  const todaySessions = useMemo(
    () => datedSessions.filter((item) => isSameDay(item.date, today)).slice(0, 4),
    [datedSessions, today],
  );

  const eventsByDate = useMemo(() => {
    const entries = new Map();
    datedSessions.forEach((item) => {
      const key = getDateKey(item.date);
      entries.set(key, [...(entries.get(key) || []), item]);
    });
    return entries;
  }, [datedSessions]);

  return (
    <div className="min-h-screen" data-testid="dashboard-page">
      <main className="hub-dashboard-main hub-home-main clinician-page is-compact">
        <div className="hub-home-grid fade-up">
          <HomeHero firstName={firstName} />
          <TodaySchedule
            date={today}
            loaded={previewSessionsEnabled || sessionsLoaded}
            previewMode={previewSessionsEnabled}
            sessions={todaySessions}
          />
          <HomeCalendar
            month={calendarMonth}
            today={today}
            eventsByDate={eventsByDate}
            onPrevious={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
            onNext={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
            onToday={() => setCalendarMonth(startOfMonth(new Date()))}
          />
        </div>

        {isActive ? (
          <div className="hub-home-active-session">
            <SessionBanner />
          </div>
        ) : null}
      </main>
    </div>
  );
}

function HomeHero({ firstName }) {
  return (
    <section
      className="hub-home-hero-card"
      data-testid="greeting-section"
      style={{ "--hub-home-hero-image": `url(${homeHeroImage})` }}
    >
      <div className="hub-home-hero-copy">
        <span className="hub-home-welcome-label">Welcome back</span>
        <h1>{getGreeting()},<br />{firstName}</h1>
        <p>Meaningful tools for brighter<br />communication journeys.</p>
        <Link to="/all-activities" className="hub-home-explore-button" data-testid="explore-activities-link">
          <Search size={20} strokeWidth={2.1} aria-hidden="true" />
          <span>Explore activities</span>
          <ArrowRight size={18} strokeWidth={2.2} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function TodaySchedule({ date, loaded, previewMode, sessions }) {
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  return (
    <aside className="hub-home-today-card" aria-labelledby="today-schedule-title">
      <header className="hub-home-today-header">
        <span className="hub-home-today-title">
          <h2 id="today-schedule-title">Today</h2>
          {previewMode ? <span>Preview data</span> : null}
        </span>
        <time dateTime={date.toISOString().slice(0, 10)}>{formattedDate}</time>
      </header>

      {!loaded ? (
        <div className="hub-home-schedule-empty" aria-live="polite">Loading today’s sessions…</div>
      ) : sessions.length ? (
        <div className="hub-home-schedule-list">
          {sessions.map(({ session, tone }) => {
            const Row = session.isPreview ? "div" : Link;
            const rowProps = session.isPreview ? {} : { to: `/sessions/${session.session_id}` };
            return (
            <Row key={session.session_id} {...rowProps} className={`hub-home-schedule-row${session.isPreview ? " is-preview" : ""}`}>
              <span className={`hub-home-schedule-dot is-${tone}`} aria-hidden="true" />
              <time>{formatSessionTime(session)}</time>
              <span className="hub-home-schedule-copy">
                <strong>{getSessionLabel(session)}</strong>
                <small>{getSessionSubtitle(session)}</small>
              </span>
              {session.isPreview ? <span /> : <ChevronRight size={18} aria-hidden="true" />}
            </Row>
            );
          })}
        </div>
      ) : (
        <div className="hub-home-schedule-empty">
          <p>No sessions scheduled today</p>
          <Link to="/sessions">View session history <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      )}
    </aside>
  );
}

function HomeCalendar({ month, today, eventsByDate, onPrevious, onNext, onToday }) {
  const days = getCalendarDays(month);
  const monthLabel = new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
  }).format(month);

  return (
    <section className="hub-home-calendar-card" aria-label={`Calendar for ${monthLabel}`}>
      <header className="hub-home-calendar-header">
        <h2>{monthLabel}</h2>
        <div className="hub-home-calendar-nav" aria-label="Calendar navigation">
          <button type="button" aria-label="Previous month" onClick={onPrevious}><ChevronLeft size={17} /></button>
          <button type="button" className="hub-home-calendar-today" onClick={onToday}>Today</button>
          <button type="button" aria-label="Next month" onClick={onNext}><ChevronRight size={17} /></button>
        </div>
      </header>

      <div className="hub-home-calendar-viewport">
        <div className="hub-home-calendar-grid" role="grid" aria-label={`${monthLabel} month view`}>
          {WEEKDAYS.map((day) => (
            <div className="hub-home-calendar-weekday" role="columnheader" key={day}>{day}</div>
          ))}
          {days.map((day) => {
            const dateEvents = eventsByDate.get(getDateKey(day.date)) || [];
            const isToday = isSameDay(day.date, today);
            const dateLabel = new Intl.DateTimeFormat("en-CA", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }).format(day.date);

            return (
              <div
                className={`hub-home-calendar-day${day.muted ? " is-muted" : ""}${isToday ? " is-selected" : ""}`}
                role="gridcell"
                aria-label={dateLabel}
                key={day.date.toISOString()}
              >
                <span className="hub-home-calendar-date">{day.day}</span>
                {dateEvents.slice(0, 2).map(({ session, tone }) => {
                  const Event = session.isPreview ? "span" : Link;
                  const eventProps = session.isPreview ? {} : { to: `/sessions/${session.session_id}` };
                  return (
                  <Event
                    className={`hub-home-calendar-event is-${tone}`}
                    {...eventProps}
                    title={getSessionLabel(session)}
                    key={session.session_id}
                  >
                    <span aria-hidden="true" />
                    {getSessionLabel(session)}
                  </Event>
                  );
                })}
                {dateEvents.length > 2 ? <span className="hub-home-calendar-more">+{dateEvents.length - 2} more</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
