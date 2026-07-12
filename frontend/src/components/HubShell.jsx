import React, { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HubSidebar } from "@/components/HubSidebar";
import { HubTopbar } from "@/components/HubTopbar";
import { Logo } from "@/components/Logo";
import { ActivitySortProvider } from "@/contexts/ActivitySortContext";

export function HubShell({ children, previewMode = false, onPreviewAction }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const shellRef = useRef(null);
  const brand = (
    <>
      <Logo size={32} />
      <b>artiqal</b>
    </>
  );

  const handleShellWheel = useCallback((event) => {
    if (!event.deltaY || event.defaultPrevented) return;

    const shell = shellRef.current;
    const target = event.target;
    if (!shell || !(target instanceof Element)) return;

    const mainScroller = shell.querySelector(".hub-app-column");
    if (!mainScroller) return;

    if (target.closest(".hub-app-column")) return;

    const horizontalScroller = target.closest(".activities-hub-category-row");
    if (horizontalScroller && Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

    const nestedScroller = target.closest(".hub-sidebar-nav");
    if (nestedScroller) {
      const canScrollDown = nestedScroller.scrollTop + nestedScroller.clientHeight < nestedScroller.scrollHeight;
      const canScrollUp = nestedScroller.scrollTop > 0;
      if ((event.deltaY > 0 && canScrollDown) || (event.deltaY < 0 && canScrollUp)) return;
    }

    mainScroller.scrollTop += event.deltaY;
    event.preventDefault();
  }, []);

  return (
    <ActivitySortProvider>
    <div
      ref={shellRef}
      onWheelCapture={handleShellWheel}
      className={`hub-app-shell ${previewMode ? "is-preview" : ""} ${sidebarCollapsed ? "is-sidebar-collapsed" : "is-sidebar-expanded"}`}
    >
      <div className="hub-left-rail">
        {previewMode ? (
          <button
            type="button"
            className="hub-shell-brand"
            aria-label="artiqal home preview"
            onClick={() => onPreviewAction?.("This is a preview of the Artiqal hub. Create a free account to open the full app.")}
          >
            {brand}
          </button>
        ) : (
          <Link to="/" className="hub-shell-brand" aria-label="artiqal home">
            {brand}
          </Link>
        )}
        <HubSidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          previewMode={previewMode}
          onPreviewAction={onPreviewAction}
        />
      </div>
      <div className="hub-app-column">
        <HubTopbar previewMode={previewMode} onPreviewAction={onPreviewAction} />
        <div className="hub-topbar-safe-occluder" aria-hidden="true" />
        <div className="hub-content-stage">{children}</div>
      </div>
    </div>
    </ActivitySortProvider>
  );
}
