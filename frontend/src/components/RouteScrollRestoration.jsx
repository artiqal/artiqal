import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

export function RouteScrollRestoration() {
  const { pathname } = useLocation();
  const hasMounted = useRef(false);
  const previousPathname = useRef(pathname);

  useLayoutEffect(() => {
    const isInitialRoute = !hasMounted.current;
    const didPathnameChange = previousPathname.current !== pathname;

    if (isInitialRoute || didPathnameChange) {
      scrollDocumentTo({ top: 0, left: 0 });
    }

    hasMounted.current = true;
    previousPathname.current = pathname;
  }, [pathname]);

  return null;
}

function scrollDocumentTo({ top, left }) {
  const hubScroller = document.querySelector(".hub-content-scroller");

  if (hubScroller) {
    hubScroller.scrollTop = top;
    hubScroller.scrollLeft = left;
  }

  window.scrollTo({ top, left, behavior: "auto" });
}
