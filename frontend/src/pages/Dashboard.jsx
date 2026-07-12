import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { filterRetiredActivities, getActivityHref } from "@/lib/activityIndex";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/contexts/SessionContext";
import { SessionBanner } from "@/components/SessionBanner";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  ListChecks,
  MoreHorizontal,
  Play,
  Plus,
  Sparkles,
  Timer,
  X,
} from "lucide-react";

const HUB_TASKS = [
  { title: "Prep for Sarah J. session", subtitle: "Language — Following Directions", time: "9:00 AM", tone: "purple" },
  { title: "Review Ethan M. progress", subtitle: "Articulation — /r/ Blends", time: "10:30 AM", tone: "blue" },
  { title: "Update goals — Mia T.", subtitle: "Receptive Language", time: "12:00 PM", tone: "violet" },
  { title: "Write session note — Liam K.", subtitle: "Fluency", time: "2:00 PM", tone: "blue" },
  { title: "Parent consult — Ava P.", subtitle: "Caregiver Education", time: "3:30 PM", tone: "pink" },
  { title: "Resource review", subtitle: "Build library", time: "Tomorrow", tone: "slate" },
];

const HUB_TASK_IDS = [
  "sarah-session-prep",
  "ethan-progress-review",
  "mia-goal-update",
  "liam-session-note",
  "ava-parent-consult",
  "resource-review",
];

const INITIAL_HUB_TASKS = HUB_TASKS.map((task, index) => ({
  ...task,
  id: HUB_TASK_IDS[index] || `task-${index}`,
}));

const CALENDAR_WEEKS = [
  [
    { day: 27, muted: true },
    { day: 28, muted: true },
    { day: 29, muted: true },
    { day: 30, muted: true },
    { day: 1 },
    { day: 2 },
    { day: 3 },
  ],
  [
    { day: 4 },
    { day: 5, events: [{ label: "9:00 Sarah J.", tone: "purple" }] },
    { day: 6, events: [{ label: "10:30 Ethan M.", tone: "mint" }] },
    { day: 7, events: [{ label: "1:00 Mia T.", tone: "amber" }] },
    { day: 8 },
    { day: 9, events: [{ label: "9:30 Liam K.", tone: "lavender" }] },
    { day: 10 },
  ],
  [
    { day: 11 },
    { day: 12, events: [{ label: "3:30 Ava P.", tone: "pink" }] },
    { day: 13 },
    { day: 14 },
    { day: 15, selected: true, events: [{ label: "11:00 Group", tone: "mint" }], more: "+2 more" },
    { day: 16 },
    { day: 17 },
  ],
  [
    { day: 18 },
    { day: 19 },
    { day: 20, events: [{ label: "2:00 Noah B.", tone: "blue" }] },
    { day: 21 },
    { day: 22 },
    { day: 23 },
    { day: 24 },
  ],
  [
    { day: 25 },
    { day: 26, note: "Memorial Day" },
    { day: 27 },
    { day: 28, events: [{ label: "10:30 Olivia S.", tone: "amber" }] },
    { day: 29 },
    { day: 30, events: [{ label: "1:30 Mason B.", tone: "lavender" }] },
    { day: 31 },
  ],
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return { text: "Good evening", emoji: "🌙" };
  if (h < 12) return { text: "Good morning", emoji: "👋" };
  if (h < 17) return { text: "Good afternoon", emoji: "👋" };
  if (h < 22) return { text: "Good evening", emoji: "👋" };
  return { text: "Good night", emoji: "🌙" };
}

export default function Dashboard({ previewMode = false, onPreviewAction }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [todoTasks, setTodoTasks] = useState(INITIAL_HUB_TASKS);
  const [pendingCompletedTasks, setPendingCompletedTasks] = useState({});
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isTodoMenuOpen, setIsTodoMenuOpen] = useState(false);
  const [isCompletedTasksOpen, setIsCompletedTasksOpen] = useState(false);
  const todoMenuRef = useRef(null);
  const completionTimersRef = useRef(new Map());

  useEffect(() => {
    api.get("/activities")
      .then((response) => setActivities(filterRetiredActivities(response.data || [])))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isTodoMenuOpen && !isCompletedTasksOpen) return undefined;

    const handlePointerDown = (event) => {
      if (isTodoMenuOpen && todoMenuRef.current && !todoMenuRef.current.contains(event.target)) {
        setIsTodoMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsTodoMenuOpen(false);
        setIsCompletedTasksOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTodoMenuOpen, isCompletedTasksOpen]);

  useEffect(() => () => {
    completionTimersRef.current.forEach(({ completeTimer, removeTimer }) => {
      clearTimeout(completeTimer);
      clearTimeout(removeTimer);
    });
    completionTimersRef.current.clear();
  }, []);

  const completeTask = (task) => {
    if (pendingCompletedTasks[task.id]) return;
    if (completionTimersRef.current.has(task.id)) return;

    setPendingCompletedTasks((current) => ({ ...current, [task.id]: "completed" }));

    const completeTimer = setTimeout(() => {
      setPendingCompletedTasks((current) => ({ ...current, [task.id]: "removing" }));

      const removeTimer = setTimeout(() => {
        setTodoTasks((current) => current.filter((item) => item.id !== task.id));
        setPendingCompletedTasks((current) => {
          const next = { ...current };
          delete next[task.id];
          return next;
        });
        setCompletedTasks((current) => {
          if (current.some((item) => item.id === task.id)) return current;
          return [{ ...task, completedAt: new Date().toISOString() }, ...current];
        });
        completionTimersRef.current.delete(task.id);
      }, 260);

      const timers = completionTimersRef.current.get(task.id);
      completionTimersRef.current.set(task.id, { ...timers, removeTimer });
    }, 5000);

    completionTimersRef.current.set(task.id, { completeTimer, removeTimer: null });
  };

  const undoTaskCompletion = (taskId) => {
    const timers = completionTimersRef.current.get(taskId);
    if (timers) {
      clearTimeout(timers.completeTimer);
      clearTimeout(timers.removeTimer);
      completionTimersRef.current.delete(taskId);
    }

    setPendingCompletedTasks((current) => {
      const next = { ...current };
      delete next[taskId];
      return next;
    });
  };

  const greeting = useMemo(getGreeting, []);
  const firstName = user?.name ? user.name.split(" ")[0] : "Guest";

  // Daily rotating "Today's pick" — deterministic by day of year so it feels intentional
  const pick = useMemo(() => {
    if (!activities.length) return null;
    const browseable = activities.filter((a) => a.category !== "all-activities");
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return browseable[day % browseable.length] || null;
  }, [activities]);

  const pickHref = pick ? getActivityHref(pick) : "/all-activities";

  const { isActive, start: startSession } = useSession();
  const activeTaskLabel = `${todoTasks.length} ${todoTasks.length === 1 ? "task" : "tasks"}`;
  const showPreviewNotice = (message = "This is a preview of the Artiqal hub. Create a free account to start activities.") => {
    onPreviewAction?.(message);
  };

  if (!previewMode) {
    return (
      <div className="min-h-screen" data-testid="dashboard-page">
        <main className="hub-dashboard-main hub-home-main clinician-page is-compact">
          <div className="hub-home-grid fade-up">
            <div className="hub-home-main-column">
              <section className="hub-home-hero-card" data-testid="greeting-section">
                <div className="hub-home-hero-flow" aria-hidden />
                <div className="hub-home-hero-copy">
                  <h1>Good morning, Guest</h1>
                  <p>Ready to help your clients achieve their communication goals today?</p>
                  <div className="hub-home-hero-actions">
                    <button type="button" onClick={startSession} className="hub-home-build-button" data-testid="start-session-btn">
                      <Box size={18} strokeWidth={2.2} />
                      Build your session
                      <ArrowRight size={18} strokeWidth={2.2} />
                    </button>
                    <Link to="/sessions" className="hub-home-history-button">
                      <Clock size={17} strokeWidth={2.1} />
                      View session history
                    </Link>
                  </div>
                </div>
              </section>

              <section className="hub-home-calendar-card" aria-label="Calendar for May 2025">
                <header className="hub-home-calendar-header">
                  <div className="hub-home-calendar-title">
                    <h2>May 2025</h2>
                    <div className="hub-home-calendar-nav" aria-label="Calendar navigation">
                      <button type="button" aria-label="Previous month"><ChevronLeft size={17} /></button>
                      <button type="button" aria-label="Next month"><ChevronRight size={17} /></button>
                    </div>
                    <button type="button" className="hub-home-calendar-today">Today</button>
                  </div>
                  <div className="hub-home-calendar-tools">
                    <button type="button" className="hub-home-calendar-mode">
                      Month <ChevronDown size={15} />
                    </button>
                    <button type="button" className="hub-home-calendar-add">
                      <Plus size={17} /> Add
                    </button>
                  </div>
                </header>
                <div className="hub-home-calendar-grid" role="grid" aria-label="May 2025 month view">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                    <div className="hub-home-calendar-weekday" key={day}>{day}</div>
                  ))}
                  {CALENDAR_WEEKS.flat().map((day, index) => (
                    <div className={`hub-home-calendar-day${day.muted ? " is-muted" : ""}${day.selected ? " is-selected" : ""}`} key={`${day.day}-${index}`}>
                      <span className="hub-home-calendar-date">{day.day}</span>
                      {day.note ? <small className="hub-home-calendar-note">{day.note}</small> : null}
                      {day.events?.map((event) => (
                        <span className={`hub-home-calendar-event is-${event.tone}`} key={event.label}>{event.label}</span>
                      ))}
                      {day.more ? <span className="hub-home-calendar-more">{day.more}</span> : null}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="hub-home-side-column">
              <aside className="hub-home-todo-card" aria-label="To do list">
                <header className="hub-home-card-header">
                  <h2>To do</h2>
                  <div className="hub-home-header-actions" ref={todoMenuRef}>
                    <span className="hub-home-task-count">{activeTaskLabel}</span>
                    <button
                      type="button"
                      className="hub-home-icon-button"
                      aria-label="To do options"
                      aria-haspopup="menu"
                      aria-expanded={isTodoMenuOpen}
                      onClick={() => setIsTodoMenuOpen((open) => !open)}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {isTodoMenuOpen ? (
                      <div className="hub-home-todo-menu" role="menu" aria-label="To do options">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setIsTodoMenuOpen(false);
                            setIsCompletedTasksOpen(true);
                          }}
                        >
                          <ListChecks size={16} strokeWidth={2.1} aria-hidden="true" />
                          View completed tasks
                        </button>
                      </div>
                    ) : null}
                  </div>
                </header>
                <div className="hub-home-task-list">
                  {todoTasks.map((task) => {
                    const completionState = pendingCompletedTasks[task.id];
                    const isCompleting = Boolean(completionState);

                    return (
                    <div
                      className={`hub-home-task-row${isCompleting ? " is-completed" : ""}${completionState === "removing" ? " is-removing" : ""}`}
                      key={task.id}
                    >
                      <button
                        type="button"
                        className="hub-home-checkbox"
                        aria-label={`Complete ${task.title}`}
                        aria-pressed={isCompleting}
                        disabled={isCompleting}
                        onClick={() => completeTask(task)}
                      >
                        <CheckCircle2 size={14} strokeWidth={2.25} aria-hidden="true" />
                      </button>
                      <span className="hub-home-task-copy">
                        <strong>{task.title}</strong>
                        <small>{task.subtitle}</small>
                      </span>
                      <span className="hub-home-task-meta">
                        <span className="hub-home-task-time">{task.time}</span>
                        <span className={`hub-home-task-dot is-${task.tone}`} aria-hidden />
                      </span>
                      {isCompleting ? (
                        <button type="button" className="hub-home-task-undo" onClick={() => undoTaskCompletion(task.id)}>
                          Undo
                        </button>
                      ) : null}
                    </div>
                    );
                  })}
                </div>
                <div className="hub-home-task-input">
                  <span>Add a new task...</span>
                  <button type="button" aria-label="Add task">
                    <Plus size={19} strokeWidth={2.2} />
                  </button>
                </div>
              </aside>
              {isCompletedTasksOpen ? (
                <div
                  className="hub-home-completed-backdrop"
                  role="presentation"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                      setIsCompletedTasksOpen(false);
                    }
                  }}
                >
                  <section
                    className="hub-home-completed-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="completed-tasks-title"
                  >
                    <header>
                      <div>
                        <span className="hub-home-completed-icon" aria-hidden="true">
                          <CheckCircle2 size={18} strokeWidth={2.15} />
                        </span>
                        <h3 id="completed-tasks-title">Completed tasks</h3>
                      </div>
                      <button type="button" aria-label="Close completed tasks" onClick={() => setIsCompletedTasksOpen(false)}>
                        <X size={17} strokeWidth={2.15} />
                      </button>
                    </header>
                    {completedTasks.length ? (
                      <div className="hub-home-completed-list">
                        {completedTasks.map((task) => (
                          <div className="hub-home-completed-row" key={task.id}>
                            <CheckCircle2 size={15} strokeWidth={2.15} aria-hidden="true" />
                            <span>
                              <strong>{task.title}</strong>
                              <small>{task.subtitle}</small>
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="hub-home-completed-empty">
                        <p>No completed tasks yet.</p>
                        <small>Finished tasks will appear here after the undo window closes.</small>
                      </div>
                    )}
                  </section>
                </div>
              ) : null}
            </div>
          </div>

          {isActive ? (
            <div className="mt-6">
              <SessionBanner />
            </div>
          ) : null}
        </main>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen"
      data-testid="dashboard-page"
      onClickCapture={
        previewMode
          ? (event) => {
              if (event.target.closest("a, button")) {
                event.preventDefault();
                event.stopPropagation();
                showPreviewNotice();
              }
            }
          : undefined
      }
    >
      <main className={`hub-dashboard-main max-w-[1640px] px-8 lg:px-20 ${previewMode ? "py-10" : "py-8"}`}>
        {/* Greeting */}
        <section className="fade-up" data-testid="greeting-section">
          <h1 className={`font-display font-extrabold tracking-tight ${previewMode ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"}`}>
            {greeting.text}
            {firstName ? `, ${firstName}` : ""} <span aria-hidden>{greeting.emoji}</span>
          </h1>
          <p className={`${previewMode ? "mt-3 text-lg" : "mt-2 text-base"} text-zinc-600 max-w-xl`}>
            {previewMode
              ? "Practice communication, one calm step at a time."
              : "Choose an activity or continue where you left off."}
          </p>
        </section>

        {isActive ? (
          <SessionBanner />
        ) : previewMode ? (
          <>
            {/* Welcome / Today's pick block */}
            <section
              className="mt-8 fade-up delay-1 relative overflow-hidden rounded-3xl"
              data-testid="welcome-block"
              style={{
                background: "var(--brand-gradient)",
              }}
            >
              <div
                className="absolute inset-0 opacity-50 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
                aria-hidden
              />
              <div
                className="absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
                style={{ background: "rgba(236,72,153,0.35)" }}
                aria-hidden
              />
              <div
                className="absolute -left-24 -bottom-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
                style={{ background: "rgba(59,130,246,0.35)" }}
                aria-hidden
              />

              <div className="relative grid sm:grid-cols-5 gap-6 p-6 sm:p-9">
                <div className="sm:col-span-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white/95 text-xs font-display font-semibold tracking-[0.18em] uppercase">
                    <Sparkles className="w-3.5 h-3.5" /> Today’s pick
                  </div>
                  <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Ready to practise today?
                  </h2>
                  <p className="mt-3 text-white/85 max-w-lg leading-relaxed">
                    {pick
                      ? <>A short session is ready for you: <span className="font-semibold text-white">{pick.title}</span>. Take your time — every prompt can be read aloud.</>
                      : "Pick a category and dive in. Take your time — every prompt can be read aloud."}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={startSession}
                      data-testid="start-session-btn"
                      className="inline-flex items-center gap-2 h-12 px-5 rounded-full bg-white text-indigo-700 font-display font-semibold hover:bg-indigo-50 transition"
                    >
                      <Timer className="w-4 h-4" /> Start session
                    </button>
                    <Link
                      to={pickHref}
                      data-testid="welcome-cta-primary"
                      className="inline-flex items-center gap-2 h-12 px-5 rounded-full border border-white/40 text-white font-display font-semibold hover:bg-white/10 transition"
                    >
                      <Play className="w-4 h-4" /> {pick ? "Today’s pick" : "Pick a category"}
                    </Link>
                    <Link
                      to="/sessions"
                      data-testid="welcome-cta-secondary"
                      className="inline-flex items-center gap-2 h-12 px-5 rounded-full border border-white/40 text-white font-display font-semibold hover:bg-white/10 transition"
                    >
                      Session history <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Decorative right card preview */}
                <div className="hidden sm:block sm:col-span-2">
                  <div className="relative h-full min-h-[200px] rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-5 flex flex-col justify-end">
                    <div className="absolute top-4 right-4 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/95 text-indigo-700">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div className="text-white/70 text-xs font-display font-semibold tracking-[0.18em] uppercase">
                      Featured
                    </div>
                    <div className="font-display text-xl font-bold text-white mt-1">
                      {pick ? pick.title : "Choose a category to begin"}
                    </div>
                    {pick ? (
                      <div className="mt-1 text-white/80 text-sm">{pick.summary}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            {/* Always-visible secondary clinician banner so they can start tracking */}
          </>
        ) : (
          <>
            {/* Compact today's pick block */}
            <section
              className="mt-6 fade-up delay-1 relative overflow-hidden rounded-[28px] border border-indigo-100/80 bg-white/85 shadow-[0_18px_55px_rgba(79,70,229,0.09)]"
              data-testid="welcome-block"
            >
              <div
                className="absolute inset-y-0 left-0 w-1.5 pointer-events-none"
                style={{
                  background: "var(--brand-gradient)",
                }}
                aria-hidden
              />
              <div
                className="absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl pointer-events-none"
                style={{ background: "rgba(99,102,241,0.13)" }}
                aria-hidden
              />

              <div className="relative grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-display font-semibold tracking-[0.16em] uppercase text-indigo-600">
                    <Sparkles className="w-3.5 h-3.5" /> Today’s pick
                  </div>
                  <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                    {pick ? pick.title : "Choose a category to begin"}
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-zinc-600 max-w-2xl leading-relaxed">
                    {pick
                      ? (pick.summary || "A short guided activity is ready when you are.")
                      : "Pick a category and dive in. Take your time — every prompt can be read aloud."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 sm:justify-end">
                  <button
                    type="button"
                    onClick={startSession}
                    data-testid="start-session-btn"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-zinc-950 text-white font-display font-semibold hover:bg-zinc-800 transition"
                  >
                    <Timer className="w-4 h-4" /> Start session
                  </button>
                  <Link
                    to={pickHref}
                    data-testid="welcome-cta-primary"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-zinc-200 bg-white text-zinc-900 font-display font-semibold hover:border-indigo-200 hover:text-indigo-700 transition"
                  >
                    <Play className="w-4 h-4" /> {pick ? "Open pick" : "Pick a category"}
                  </Link>
                  <Link
                    to="/sessions"
                    data-testid="welcome-cta-secondary"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-zinc-200 bg-white text-zinc-700 font-display font-semibold hover:border-indigo-200 hover:text-indigo-700 transition"
                  >
                    Session history <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}

      </main>
    </div>
  );
}
