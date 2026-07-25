import React, { act } from "react";
import { createRoot } from "react-dom/client";

import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
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

describe("Login", () => {
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
    delete document.documentElement.dataset.livePreview;
    container.remove();
  });

  async function renderLogin() {
    await act(async () => root.render(<Login />));
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

  test("renders the artiqal sign-in experience and existing authentication options", async () => {
    await renderLogin();

    expect(container.querySelector("h1").textContent).toBe("Welcome back!");
    expect(container.textContent).toContain("Sign in to access your artiqal workspace.");
    expect(container.textContent).toContain("BUILT FOR ADULT SPEECH & LANGUAGE THERAPY");
    expect(container.textContent).toContain("Meaningful tools for better communication.");
    expect(container.textContent).toContain(
      "Access evidence-informed activities and resources designed to support meaningful practice.",
    );
    expect(container.textContent).not.toContain("Concentric");
    expect(container.querySelector('[data-testid="google-signin-btn"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="login-forgot-password-link"]').getAttribute("href")).toBe(
      "/forgot-password",
    );
    const registerLink = container.querySelector('[data-testid="login-to-register-link"]');
    expect(registerLink.getAttribute("href")).toBe("/register");
    expect(registerLink.textContent).toBe("Start your free trial");
    expect(container.textContent).toContain("Don’t have an account?");
    expect(container.querySelector('[name="email"]').required).toBe(true);
    expect(container.querySelector('[name="password"]').required).toBe(true);
  });

  test("offers a local-only route into the clinician hub during live preview", async () => {
    document.documentElement.dataset.livePreview = "true";
    await renderLogin();

    const previewLink = container.querySelector('[data-testid="login-preview-access-link"]');
    expect(previewLink.getAttribute("href")).toBe("/dashboard");
    expect(previewLink.textContent).toBe("Continue to clinician hub");
    expect(container.textContent).toContain("Available only while working in this local preview.");
  });

  test("renders a clearly pending password reset route without a fake reset form", async () => {
    await act(async () => root.render(<ForgotPassword />));

    expect(container.querySelector("h1").textContent).toBe("Reset your password");
    expect(container.textContent).toContain(
      "Enter your email address and we’ll send you instructions to reset your password.",
    );
    expect(container.textContent).toContain("Meaningful tools for better communication.");
    expect(container.querySelector('[data-testid="forgot-password-email-input"]').required).toBe(true);
    expect(container.querySelector('[data-testid="forgot-password-submit"]').textContent).toBe("Send reset link");
    expect(container.querySelector('[data-testid="forgot-password-to-login-link"]').getAttribute("href")).toBe(
      "/login",
    );
  });

  test("shows the private confirmation state only after a successful reset request", async () => {
    api.post.mockResolvedValue({ data: { accepted: true } });
    await act(async () => root.render(<ForgotPassword />));
    await setField("email", "clinician@example.com");

    await submitForm();

    expect(api.post).toHaveBeenCalledWith("/auth/forgot-password", { email: "clinician@example.com" });
    expect(container.querySelector("h1").textContent).toBe("Check your email");
    expect(container.textContent).toContain("We’ve sent a password reset link to");
    expect(container.textContent).toContain("clinician@example.com");
    expect(container.querySelector('[data-testid="forgot-password-open-email"]').getAttribute("href")).toBe("mailto:");
    expect(container.textContent).not.toContain("account exists");
  });

  test("keeps the email and resends through the same reset request endpoint", async () => {
    api.post.mockResolvedValue({ data: { accepted: true } });
    await act(async () => root.render(<ForgotPassword />));
    await setField("email", "clinician@example.com");
    await submitForm();

    await act(async () => {
      container.querySelector('[data-testid="forgot-password-resend"]').click();
      await Promise.resolve();
    });

    expect(api.post).toHaveBeenCalledTimes(2);
    expect(api.post).toHaveBeenLastCalledWith("/auth/forgot-password", { email: "clinician@example.com" });
    expect(container.textContent).toContain("A new password reset link has been requested.");
  });

  test("disables the resend action and announces its loading state", async () => {
    let resolveResend;
    api.post
      .mockResolvedValueOnce({ data: { accepted: true } })
      .mockImplementationOnce(() => new Promise((resolve) => {
        resolveResend = resolve;
      }));
    await act(async () => root.render(<ForgotPassword />));
    await setField("email", "clinician@example.com");
    await submitForm();

    const resendButton = container.querySelector('[data-testid="forgot-password-resend"]');
    await act(async () => {
      resendButton.click();
      await Promise.resolve();
    });

    expect(resendButton.disabled).toBe(true);
    expect(resendButton.textContent).toBe("Resending…");

    await act(async () => {
      resolveResend({ data: { accepted: true } });
      await Promise.resolve();
    });

    expect(resendButton.disabled).toBe(false);
    expect(resendButton.textContent).toBe("Didn’t receive the email? Resend");
  });

  test("preserves the form and reports backend failures without showing success", async () => {
    api.post.mockRejectedValue({ response: { status: 503, data: { detail: "Unavailable" } } });
    await act(async () => root.render(<ForgotPassword />));
    await setField("email", "clinician@example.com");

    await submitForm();

    const error = container.querySelector('[data-testid="forgot-password-error"]');
    expect(error.getAttribute("role")).toBe("alert");
    expect(error.textContent).toContain("couldn’t request a password reset link");
    expect(container.querySelector('[name="email"]').value).toBe("clinician@example.com");
    expect(container.querySelector('[data-testid="forgot-password-success"]')).toBeNull();
  });

  test("shows backend retry timing and keeps the confirmation state after a limited resend", async () => {
    api.post
      .mockResolvedValueOnce({ data: { accepted: true } })
      .mockRejectedValueOnce({ response: { status: 429, data: { retryAfterSeconds: 75 } } });
    await act(async () => root.render(<ForgotPassword />));
    await setField("email", "clinician@example.com");
    await submitForm();

    await act(async () => {
      container.querySelector('[data-testid="forgot-password-resend"]').click();
      await Promise.resolve();
    });

    expect(container.querySelector('[data-testid="forgot-password-success"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="forgot-password-error"]').textContent).toContain(
      "Try again in 75 seconds.",
    );
  });

  test("preserves the existing successful email sign-in flow", async () => {
    const user = { id: "clinician-1", email: "clinician@example.com" };
    api.post.mockResolvedValue({ data: user });
    await renderLogin();
    await setField("email", "clinician@example.com");
    await setField("password", "secure-password");

    await submitForm();

    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "clinician@example.com",
      password: "secure-password",
    });
    expect(mockSetUser).toHaveBeenCalledWith(user);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("announces authentication errors and preserves entered values", async () => {
    api.post.mockRejectedValue({ response: { data: { detail: "Incorrect email or password." } } });
    await renderLogin();
    await setField("email", "clinician@example.com");
    await setField("password", "wrong-password");

    await submitForm();

    const error = container.querySelector('[data-testid="login-error"]');
    expect(error.getAttribute("role")).toBe("alert");
    expect(error.textContent).toBe("Incorrect email or password.");
    expect(container.querySelector('[name="email"]').value).toBe("clinician@example.com");
    expect(container.querySelector('[name="password"]').value).toBe("wrong-password");
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
