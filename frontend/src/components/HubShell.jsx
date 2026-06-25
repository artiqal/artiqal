import React from "react";
import { HubSidebar } from "@/components/HubSidebar";
import { HubTopbar } from "@/components/HubTopbar";

export function HubShell({ children, previewMode = false, onPreviewAction }) {
  return (
    <div className={`hub-app-shell ${previewMode ? "is-preview" : ""}`}>
      <HubSidebar previewMode={previewMode} onPreviewAction={onPreviewAction} />
      <div className="hub-app-column">
        <HubTopbar previewMode={previewMode} onPreviewAction={onPreviewAction} />
        <div className="hub-content-stage">{children}</div>
      </div>
    </div>
  );
}
