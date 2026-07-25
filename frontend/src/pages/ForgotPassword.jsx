import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthenticationShell } from "@/components/auth/AuthenticationShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const requestReset = async ({ isResend = false } = {}) => {
    setError("");
    setResendMessage("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      if (isResend) {
        setResendMessage("A new password reset link has been requested.");
      }
    } catch (requestError) {
      const status = requestError.response?.status;
      const retryAfterSeconds = Number(requestError.response?.data?.retryAfterSeconds);

      if (status === 429) {
        const waitMessage = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
          ? ` Try again in ${Math.ceil(retryAfterSeconds)} seconds.`
          : " Please try again later.";
        setError(`Too many password reset requests.${waitMessage}`);
      } else {
        setError("We couldn’t request a password reset link. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    await requestReset();
  };

  return (
    <AuthenticationShell
      heading={sent ? "Check your email" : "Reset your password"}
      headingId="forgot-password-heading"
      introIcon={sent ? <Mail aria-hidden="true" /> : null}
      pageTestId="forgot-password-page"
      supportingText={sent ? (
        <>
          We’ve sent a password reset link to
          <strong className="login-reset-email">{email}</strong>
        </>
      ) : "Enter your email address and we’ll send you instructions to reset your password."}
    >
      {sent ? (
        <div className="login-reset-success fade-up delay-1" data-testid="forgot-password-success">
          <a href="mailto:" className="login-submit login-open-email" data-testid="forgot-password-open-email">
            Open email
          </a>

          <Button
            type="button"
            variant="ghost"
            className="login-resend-button"
            disabled={loading}
            onClick={() => requestReset({ isResend: true })}
            data-testid="forgot-password-resend"
          >
            {loading ? "Resending…" : "Didn’t receive the email? Resend"}
          </Button>

          {resendMessage ? (
            <p className="login-reset-status" role="status" aria-live="polite">
              {resendMessage}
            </p>
          ) : null}

          {error ? (
            <div className="login-error" role="alert" data-testid="forgot-password-error">
              {error}
            </div>
          ) : null}
        </div>
      ) : (
        <form onSubmit={submit} className="login-form login-reset-form fade-up delay-1" data-testid="forgot-password-form">
          <div className="login-field">
            <Label htmlFor="reset-email">Email address</Label>
            <Input
              id="reset-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-describedby={error ? "forgot-password-error" : undefined}
              data-testid="forgot-password-email-input"
            />
          </div>

          {error ? (
            <div id="forgot-password-error" className="login-error" role="alert" data-testid="forgot-password-error">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="login-submit" disabled={loading} data-testid="forgot-password-submit">
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="login-register-prompt fade-up delay-2">
        Remember your password?{" "}
        <Link to="/login" data-testid="forgot-password-to-login-link">
          Sign in
        </Link>
      </p>
    </AuthenticationShell>
  );
}
