import React, { act } from "react";
import { createRoot } from "react-dom/client";

import Register from "./Register";
import { api } from "@/lib/api";

const mockNavigate = jest.fn();
const mockSetUser = jest.fn();

jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");
    return {
      Link: ({ children, to, ...props }) => React.createElement("a", { href: to, ...props }, children),
      useNavigate: () => mockNavigate,
    };
  },
  { virtual: true },
);

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ setUser: mockSetUser }),
}));

jest.mock("@/lib/api", () => ({
  api: { post: jest.fn() },
  formatApiErrorDetail: (detail) => detail || "",
}));

describe("Register", () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    mockNavigate.mockClear();
    mockSetUser.mockClear();
    api.post.mockReset();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  async function renderPage() {
    await act(async () => root.render(<Register />));
  }

  async function setField(name, value) {
    const field = container.querySelector(`[name="${name}"]`);
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    await act(async () => {
      setter.call(field, value);
      field.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  async function submitForm() {
    await act(async () => {
      container.querySelector("form").dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();
    });
  }

  test("uses the shared artiqal authentication experience and registration copy", async () => {
    await renderPage();

    expect(container.querySelector("h1").textContent).toBe("Create your account");
    expect(container.textContent).toContain("Start your free trial and set up your artiqal workspace.");
    expect(container.textContent).toContain("Meaningful tools for better communication.");
    expect(container.textContent).not.toContain("Concentric");
    expect(container.querySelector('[data-testid="google-signin-btn"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="register-submit-btn"]').textContent).toBe(
      "Start your free trial",
    );
    expect(container.querySelector('[data-testid="register-to-login-link"]').getAttribute("href")).toBe(
      "/login",
    );
  });

  test("provides labelled required registration fields with restrained password guidance", async () => {
    await renderPage();

    const expectedFields = ["name", "email", "password", "confirmPassword"];
    expectedFields.forEach((name) => {
      expect(container.querySelector(`[name="${name}"]`).required).toBe(true);
    });
    expect(container.querySelector('[name="password"]').minLength).toBe(6);
    expect(container.querySelector('[name="confirmPassword"]').minLength).toBe(6);
    expect(container.textContent).toContain("Use at least 6 characters.");
  });

  test("blocks mismatched passwords without changing the registration API contract", async () => {
    await renderPage();
    await setField("name", "Test Clinician");
    await setField("email", "clinician@example.com");
    await setField("password", "secure-password");
    await setField("confirmPassword", "different-password");

    await submitForm();

    expect(api.post).not.toHaveBeenCalled();
    expect(container.querySelector('[data-testid="register-error"]').textContent).toBe(
      "The passwords do not match.",
    );
  });

  test("preserves the existing registration request and dashboard navigation", async () => {
    const user = { user_id: "user_new", email: "clinician@example.com" };
    api.post.mockResolvedValue({ data: user });
    await renderPage();
    await setField("name", "Test Clinician");
    await setField("email", "clinician@example.com");
    await setField("password", "secure-password");
    await setField("confirmPassword", "secure-password");

    await submitForm();

    expect(api.post).toHaveBeenCalledWith("/auth/register", {
      name: "Test Clinician",
      email: "clinician@example.com",
      password: "secure-password",
    });
    expect(mockSetUser).toHaveBeenCalledWith(user);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("disables the primary action while account creation is pending", async () => {
    let resolveRegistration;
    api.post.mockImplementation(() => new Promise((resolve) => {
      resolveRegistration = resolve;
    }));
    await renderPage();
    await setField("name", "Test Clinician");
    await setField("email", "clinician@example.com");
    await setField("password", "secure-password");
    await setField("confirmPassword", "secure-password");

    await act(async () => {
      container.querySelector("form").dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();
    });

    const submitButton = container.querySelector('[data-testid="register-submit-btn"]');
    expect(submitButton.disabled).toBe(true);
    expect(submitButton.textContent).toBe("Creating account…");

    await act(async () => {
      resolveRegistration({ data: { user_id: "user_new", email: "clinician@example.com" } });
      await Promise.resolve();
    });

    expect(submitButton.disabled).toBe(false);
  });

  test("announces API errors and preserves entered values", async () => {
    api.post.mockRejectedValue({ response: { data: { detail: "Email already registered" } } });
    await renderPage();
    await setField("name", "Test Clinician");
    await setField("email", "clinician@example.com");
    await setField("password", "secure-password");
    await setField("confirmPassword", "secure-password");

    await submitForm();

    const error = container.querySelector('[data-testid="register-error"]');
    expect(error.getAttribute("role")).toBe("alert");
    expect(error.textContent).toBe("Email already registered");
    expect(container.querySelector('[name="name"]').value).toBe("Test Clinician");
    expect(container.querySelector('[name="email"]').value).toBe("clinician@example.com");
    expect(container.querySelector('[name="password"]').value).toBe("secure-password");
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
