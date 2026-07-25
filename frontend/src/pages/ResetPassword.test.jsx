import React, { act } from "react";
import { createRoot } from "react-dom/client";

import ResetPassword from "./ResetPassword";
import { api } from "@/lib/api";

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

jest.mock("@/lib/api", () => ({
  api: { post: jest.fn() },
  formatApiErrorDetail: (detail) => detail || "",
}));

describe("ResetPassword", () => {
  const token = "valid-reset-token-value-that-is-long-enough";
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    api.post.mockReset();
    window.history.replaceState({}, "", `/reset-password?token=${token}`);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  async function renderPage() {
    await act(async () => root.render(<ResetPassword />));
  }

  async function setField(name, value) {
    const field = container.querySelector(`[name="${name}"]`);
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    await act(async () => {
      setter.call(field, value);
      field.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  async function submit() {
    await act(async () => {
      container.querySelector("form").dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();
    });
  }

  test("shows the secure reset form when a token is present", async () => {
    await renderPage();

    expect(container.querySelector("h1").textContent).toBe("Choose a new password");
    expect(container.querySelector('[name="newPassword"]').required).toBe(true);
    expect(container.querySelector('[name="newPassword"]').minLength).toBe(8);
    expect(container.querySelector('[name="confirmPassword"]').autocomplete).toBe("new-password");
    expect(container.textContent).not.toContain(token);
  });

  test("rejects a missing token before showing password fields", async () => {
    window.history.replaceState({}, "", "/reset-password");
    await renderPage();

    expect(container.querySelector('[data-testid="reset-password-invalid"]')).not.toBeNull();
    expect(container.textContent).toContain("invalid or has expired");
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector('a[href="/forgot-password"]')).not.toBeNull();
  });

  test("prevents mismatched passwords without calling the API", async () => {
    await renderPage();
    await setField("newPassword", "new-password-one");
    await setField("confirmPassword", "new-password-two");

    await submit();

    expect(api.post).not.toHaveBeenCalled();
    expect(container.querySelector('[data-testid="reset-password-error"]').textContent).toBe(
      "The passwords do not match.",
    );
  });

  test("submits the token and password then shows a sign-in confirmation", async () => {
    api.post.mockResolvedValue({ data: { message: "Your password has been reset successfully." } });
    await renderPage();
    await setField("newPassword", "new-secure-password");
    await setField("confirmPassword", "new-secure-password");

    await submit();

    expect(api.post).toHaveBeenCalledWith("/auth/reset-password", {
      token,
      newPassword: "new-secure-password",
    });
    expect(container.querySelector('[data-testid="reset-password-success"]')).not.toBeNull();
    expect(container.textContent).toContain("Your password has been updated");
    expect(container.querySelector('a[href="/login"]')).not.toBeNull();
    expect(container.textContent).not.toContain(token);
    expect(window.location.search).toBe("");
  });

  test("shows the invalid-link state after an expired or reused token response", async () => {
    api.post.mockRejectedValue({
      response: { status: 400, data: { detail: "This password reset link is invalid or has expired." } },
    });
    await renderPage();
    await setField("newPassword", "new-secure-password");
    await setField("confirmPassword", "new-secure-password");

    await submit();

    expect(container.querySelector('[data-testid="reset-password-invalid"]')).not.toBeNull();
    expect(container.querySelector("form")).toBeNull();
  });

  test("preserves password fields after a transient backend failure", async () => {
    api.post.mockRejectedValue({ response: { status: 503, data: { detail: "Please try again." } } });
    await renderPage();
    await setField("newPassword", "new-secure-password");
    await setField("confirmPassword", "new-secure-password");

    await submit();

    expect(container.querySelector('[data-testid="reset-password-error"]').textContent).toBe(
      "Please try again.",
    );
    expect(container.querySelector('[name="newPassword"]').value).toBe("new-secure-password");
    expect(container.querySelector('[name="confirmPassword"]').value).toBe("new-secure-password");
  });
});
