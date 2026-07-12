import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/contexts/SessionContext";
import {
  Bell,
  Box,
  ChevronDown,
} from "lucide-react";

export function HubTopbar({ previewMode = false, onPreviewAction }) {
  const { user } = useAuth();
  const { start: startSession } = useSession();
  const location = useLocation();
  const displayName = user?.name || "Guest Clinician";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  const navItems = [
    { label: "Home", to: "/dashboard", active: location.pathname === "/dashboard" },
    { label: "SLP Blueprint" },
    { label: "Help" },
    { label: "Updates" },
  ];

  const handleBuildSession = () => {
    // TODO: Route this to the dedicated session builder when that workflow exists.
    startSession();
  };

  return (
    <header className="hub-topbar">
      <div className="hub-topbar-brand">
        <nav aria-label="Clinician app navigation">
          {navItems.map((item) =>
            item.to ? (
              <Link key={item.label} to={item.to} className={item.active ? "is-active" : ""}>
                {item.label}
              </Link>
            ) : (
              <button key={item.label} type="button" onClick={() => onPreviewAction?.(`${item.label} will be available in a future clinician workspace update.`)}>
                {item.label}
              </button>
            ),
          )}
        </nav>
      </div>
      <div className="hub-topbar-actions">
        <button type="button" className="hub-build-session-button" onClick={handleBuildSession}>
          <Box size={15} strokeWidth={2.2} aria-hidden="true" />
          <span>Build session</span>
        </button>
        <button type="button" className="hub-notification-button" aria-label="Notifications">
          <Bell size={17} />
          <span aria-hidden="true" />
        </button>
        <button className="hub-clinician-pill" type="button">
          <span>{initials || "GC"}</span>
          <b>{displayName}</b>
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
