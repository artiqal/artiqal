import React, { act } from "react";
import { createRoot } from "react-dom/client";

import Dashboard from "./Dashboard";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: { get: jest.fn() },
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { name: "Alex Morgan" } }),
}));

jest.mock("@/contexts/SessionContext", () => ({
  useSession: () => ({ isActive: false }),
}));

jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");
    return {
      Link: ({ children, to, ...props }) => React.createElement("a", { href: to, ...props }, children),
    };
  },
  { virtual: true },
);

describe("Dashboard", () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    window.history.replaceState({}, "", "/dashboard");
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    jest.clearAllMocks();
  });

  it("renders the personalised hero and real saved sessions without demo entries", async () => {
    const createdAt = new Date();
    createdAt.setHours(10, 30, 0, 0);
    api.get.mockResolvedValue({
      data: [{
        session_id: "session-1",
        created_at: createdAt.toISOString(),
        patient_label: "Clinical session",
        name: "Word finding plan",
        summary: { totals: { activities_count: 2 } },
      }],
    });

    await act(async () => {
      root.render(<Dashboard />);
    });

    expect(api.get).toHaveBeenCalledWith("/sessions");
    expect(container.textContent).toContain("Alex");
    expect(container.textContent).toContain("Meaningful tools for brighter");
    expect(container.querySelector('[data-testid="explore-activities-link"]')?.getAttribute("href")).toBe("/all-activities");
    expect(container.textContent).toContain("Clinical session");
    expect(container.textContent).not.toContain("Sarah J.");
  });

  it("shows an honest empty state and supports calendar navigation", async () => {
    api.get.mockResolvedValue({ data: [] });

    await act(async () => {
      root.render(<Dashboard />);
    });

    expect(container.textContent).toContain("No sessions scheduled today");
    const heading = container.querySelector(".hub-home-calendar-header h2");
    const originalMonth = heading.textContent;
    await act(async () => {
      container.querySelector('button[aria-label="Next month"]').click();
    });
    expect(heading.textContent).not.toBe(originalMonth);
    await act(async () => {
      container.querySelector(".hub-home-calendar-today").click();
    });
    expect(heading.textContent).toBe(originalMonth);
  });

  it("shows opt-in preview sessions without linking them to saved-session routes", async () => {
    window.history.replaceState({}, "", "/dashboard?previewSessions=1");
    api.get.mockResolvedValue({ data: [] });

    await act(async () => {
      root.render(<Dashboard />);
    });

    expect(container.textContent).toContain("Preview data");
    expect(container.textContent).toContain("Alex R.");
    expect(container.textContent).toContain("Functional communication");
    expect(container.querySelectorAll(".hub-home-schedule-row")).toHaveLength(4);
    expect(container.querySelector('.hub-home-schedule-row[href*="preview-session"]')).toBeNull();
    expect(container.querySelectorAll(".hub-home-calendar-event").length).toBeGreaterThan(4);
  });
});
