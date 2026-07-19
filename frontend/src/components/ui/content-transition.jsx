import React, { useEffect, useRef, useState } from "react";

const EXIT_DURATION_MS = 110;

function prefersReducedMotion() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ContentTransition({ contentKey, children, className = "" }) {
  const [displayedContent, setDisplayedContent] = useState(() => ({
    key: contentKey,
    children,
  }));
  const [state, setState] = useState("stable");
  const pendingContentRef = useRef({ key: contentKey, children });
  const exitTimerRef = useRef(null);

  useEffect(() => {
    pendingContentRef.current = { key: contentKey, children };

    const clearExitTimer = () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };

    if (contentKey === displayedContent.key) {
      clearExitTimer();
      setState("stable");
      setDisplayedContent((current) => (
        current.children === children ? current : { ...current, children }
      ));
      return clearExitTimer;
    }

    if (prefersReducedMotion()) {
      clearExitTimer();
      setDisplayedContent({ key: contentKey, children });
      setState("stable");
      return clearExitTimer;
    }

    clearExitTimer();
    setState("exiting");
    exitTimerRef.current = window.setTimeout(() => {
      exitTimerRef.current = null;
      setDisplayedContent(pendingContentRef.current);
      setState("entering");
    }, EXIT_DURATION_MS);

    return clearExitTimer;
  }, [children, contentKey, displayedContent.key]);

  return (
    <div
      className={`content-transition ${className}`.trim()}
      data-content-key={displayedContent.key}
      data-transition-state={state}
    >
      {displayedContent.children}
    </div>
  );
}
