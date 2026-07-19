import React, { useEffect, useRef, useState } from "react";
import "./rotating-headline.css";

const EXIT_DURATION_MS = 180;

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ));

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event) => setReducedMotion(event.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener?.(handleChange);
    return () => mediaQuery.removeListener?.(handleChange);
  }, []);

  return reducedMotion;
}

export function RotatingHeadline({ fixedLine, phrases, intervalMs = 3000 }) {
  const availablePhrases = phrases?.filter(Boolean) ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const activePhrase = availablePhrases[activeIndex] ?? availablePhrases[0] ?? "";

  useEffect(() => {
    if (activeIndex >= availablePhrases.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, availablePhrases.length]);

  useEffect(() => {
    const clearExitTimer = () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };

    if (reducedMotion || availablePhrases.length < 2) {
      clearExitTimer();
      setIsExiting(false);
      return clearExitTimer;
    }

    const cycleTimer = window.setInterval(() => {
      clearExitTimer();
      setIsExiting(true);
      exitTimerRef.current = window.setTimeout(() => {
        exitTimerRef.current = null;
        setActiveIndex((current) => (current + 1) % availablePhrases.length);
        setIsExiting(false);
      }, EXIT_DURATION_MS);
    }, intervalMs);

    return () => {
      window.clearInterval(cycleTimer);
      clearExitTimer();
    };
  }, [availablePhrases.length, intervalMs, reducedMotion]);

  return (
    <span className="rotating-headline" data-reduced-motion={reducedMotion || undefined}>
      <span className="rotating-headline-fixed">{fixedLine}</span>
      <span className="rotating-headline-line">
        {availablePhrases.map((phrase) => (
          <span key={phrase} className="rotating-headline-reserve" aria-hidden="true">
            {phrase}
          </span>
        ))}
        <span
          key={`${activeIndex}-${activePhrase}`}
          className={`rotating-headline-value${isExiting ? " is-exiting" : ""}`}
          data-active-phrase={activePhrase}
        >
          {activePhrase}
        </span>
      </span>
    </span>
  );
}
