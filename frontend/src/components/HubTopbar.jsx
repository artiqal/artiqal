import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import {
  ClipboardList,
  Home,
  Maximize2,
} from "lucide-react";

export function HubTopbar({ previewMode = false, onPreviewAction }) {
  const { user } = useAuth();
  const displayName = user?.name || "Guest Clinician";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <header className="hub-topbar">
      <div className="hub-topbar-brand">
        {previewMode ? (
          <button type="button" className="hub-topbar-logo" aria-label="Artiqal home preview" onClick={() => onPreviewAction?.("This is a preview of the Artiqal hub. Create a free account to open the full app.")}>
            <Logo size={31} /><b>artiqal</b>
          </button>
        ) : (
          <Link to="/" className="hub-topbar-logo" aria-label="Artiqal home"><Logo size={31} /><b>artiqal</b></Link>
        )}
        <nav aria-label="Company navigation">
          <a href="#pricing">Pricing</a>
          <a href="#vision">Vision</a>
        </nav>
      </div>
      <div className="hub-topbar-actions">
        {previewMode ? (
          <>
            <button type="button" aria-label="Home" onClick={() => onPreviewAction?.("This is a preview of the Artiqal hub. Create a free account to open the full app.")}><Home size={18} /></button>
            <button type="button" aria-label="Session history" onClick={() => onPreviewAction?.("Session history is available inside the full Artiqal hub.")}><ClipboardList size={18} /></button>
          </>
        ) : (
          <>
            <Link to="/dashboard" aria-label="Home"><Home size={18} /></Link>
            <Link to="/sessions" aria-label="Session history"><ClipboardList size={18} /></Link>
          </>
        )}
        <button type="button" aria-label="Expand view"><Maximize2 size={17} /></button>
        <button className="hub-clinician-pill" type="button">
          <span>{initials || "GC"}</span>{displayName}
        </button>
      </div>
    </header>
  );
}
