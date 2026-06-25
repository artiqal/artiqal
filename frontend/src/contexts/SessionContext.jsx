import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const KEY = "concentric_active_session_v1";
const SessionContext = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(s) {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function SessionProvider({ children }) {
  const [active, setActive] = useState(() => load());
  const [now, setNow] = useState(() => Date.now());
  const tickRef = useRef(null);

  // Tick every second while active
  useEffect(() => {
    if (!active) {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }
    tickRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [active]);

  // Persist on change
  useEffect(() => {
    persist(active);
  }, [active]);

  const start = useCallback(() => {
    const newSession = {
      started_at: new Date().toISOString(),
      activities: [],
      attempts: [],
      cues: [],
    };
    setActive(newSession);
    return newSession;
  }, []);

  const cancel = useCallback(() => {
    setActive(null);
  }, []);

  const end = useCallback(() => {
    if (!active) return null;
    const ended = { ...active, ended_at: new Date().toISOString() };
    setActive(null);
    return ended;
  }, [active]);

  const logActivity = useCallback((a) => {
    setActive((s) => {
      if (!s) return s;
      const key = `${a.category}/${a.activity_slug}`;
      const exists = s.activities.some((x) => `${x.category}/${x.activity_slug}` === key);
      if (exists) return s;
      return {
        ...s,
        activities: [...s.activities, { ...a, started_at: new Date().toISOString() }],
      };
    });
  }, []);

  const logAttempt = useCallback((entry) => {
    setActive((s) => {
      if (!s) return s;
      return {
        ...s,
        attempts: [...s.attempts, { ...entry, ts: new Date().toISOString() }],
      };
    });
  }, []);

  const logCue = useCallback((entry) => {
    setActive((s) => {
      if (!s) return s;
      return {
        ...s,
        cues: [...s.cues, { ...entry, ts: new Date().toISOString() }],
      };
    });
  }, []);

  const elapsedSec = active
    ? Math.max(0, Math.floor((now - new Date(active.started_at).getTime()) / 1000))
    : 0;

  const stats = active
    ? {
        activities: new Set(active.activities.map((a) => `${a.category}/${a.activity_slug}`)).size,
        total: active.attempts.length,
        correct: active.attempts.filter((a) => a.correct).length,
        incorrect: active.attempts.filter((a) => !a.correct).length,
        cues: active.cues.length,
      }
    : null;

  const value = {
    active,
    isActive: !!active,
    elapsedSec,
    stats,
    start,
    end,
    cancel,
    logActivity,
    logAttempt,
    logCue,
  };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

export function formatElapsed(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
