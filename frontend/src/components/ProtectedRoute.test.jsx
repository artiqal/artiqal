import React, { act } from "react";
import { createRoot } from "react-dom/client";

import { ProtectedRoute } from "./ProtectedRoute";

let mockAuth = { loading: false, user: false };

jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");
    return {
      Navigate: ({ replace, state, to }) => React.createElement(
        "div",
        {
          "data-from": state?.from?.pathname,
          "data-replace": String(replace),
          "data-testid": "navigate",
          "data-to": to,
        },
      ),
      useLocation: () => ({ pathname: "/dashboard" }),
    };
  },
  { virtual: true },
);

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

describe("ProtectedRoute", () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    mockAuth = { loading: false, user: false };
    delete document.documentElement.dataset.livePreview;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    delete document.documentElement.dataset.livePreview;
    container.remove();
  });

  async function renderRoute() {
    await act(async () => root.render(
      <ProtectedRoute>
        <div data-testid="protected-content">Clinician hub</div>
      </ProtectedRoute>,
    ));
  }

  test("allows the explicit localhost live preview without a user session", async () => {
    document.documentElement.dataset.livePreview = "true";
    await renderRoute();

    expect(container.querySelector('[data-testid="protected-content"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="navigate"]')).toBeNull();
  });

  test("redirects unauthenticated users when local preview access is absent", async () => {
    await renderRoute();

    const navigation = container.querySelector('[data-testid="navigate"]');
    expect(navigation.getAttribute("data-to")).toBe("/login");
    expect(navigation.getAttribute("data-replace")).toBe("true");
    expect(navigation.getAttribute("data-from")).toBe("/dashboard");
    expect(container.querySelector('[data-testid="protected-content"]')).toBeNull();
  });

  test("continues to admit authenticated users", async () => {
    mockAuth = { loading: false, user: { user_id: "user_1" } };
    await renderRoute();

    expect(container.querySelector('[data-testid="protected-content"]')).not.toBeNull();
  });

  test("waits for the authentication check before redirecting", async () => {
    mockAuth = { loading: true, user: null };
    await renderRoute();

    expect(container.querySelector('[aria-label="Checking authentication"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="navigate"]')).toBeNull();
  });
});
