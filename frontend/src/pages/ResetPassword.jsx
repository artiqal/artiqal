import React, { useMemo, useState } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthenticationShell } from "@/components/auth/AuthenticationShell";

const INVALID_LINK_MESSAGE = "This password reset link is invalid or has expired.";

export default function ResetPassword() {
  const token = useMemo(
    () => new URLSearchParams(window.location.search).get("token")?.trim() || "",
    [],
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [invalidToken, setInvalidToken] = useState(token.length < 32);
  const [complete, setComplete] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      window.history.replaceState({}, "", "/reset-password");
      setComplete(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      const status = requestError.response?.status;
      if (status === 400 || status === 404) {
        setInvalidToken(true);
      } else {
        setError(
          formatApiErrorDetail(requestError.response?.data?.detail)
          || "We couldn’t reset your password. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (complete) {
    return (
      <AuthenticationShell
        heading="Password reset"
        headingId="reset-password-heading"
        introIcon={<CheckCircle2 aria-hidden="true" />}
        pageTestId="reset-password-page"
        supportingText="Your password has been updated. You can now sign in with your new password."
      >
        <div className="login-reset-success fade-up delay-1" role="status" data-testid="reset-password-success">
          <Link to="/login" className="login-submit login-open-email">
            Return to sign in
          </Link>
        </div>
      </AuthenticationShell>
    );
  }

  if (invalidToken) {
    return (
      <AuthenticationShell
        heading="Reset link unavailable"
        headingId="reset-password-heading"
        introIcon={<KeyRound aria-hidden="true" />}
        pageTestId="reset-password-page"
        supportingText={INVALID_LINK_MESSAGE}
      >
        <div className="login-reset-success fade-up delay-1" data-testid="reset-password-invalid">
          <Link to="/forgot-password" className="login-submit login-open-email">
            Request a new link
          </Link>
          <p className="login-register-prompt">
            <Link to="/login">Return to sign in</Link>
          </p>
        </div>
      </AuthenticationShell>
    );
  }

  return (
    <AuthenticationShell
      heading="Choose a new password"
      headingId="reset-password-heading"
      pageTestId="reset-password-page"
      supportingText="Enter and confirm a secure new password for your artiqal account."
    >
      <form onSubmit={submit} className="login-form login-reset-form fade-up delay-1" data-testid="reset-password-form">
        <div className="login-field">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            aria-describedby={error ? "reset-password-error" : "reset-password-guidance"}
          />
          <p id="reset-password-guidance" className="login-password-guidance">
            Use at least 8 characters.
          </p>
        </div>

        <div className="login-field">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            aria-describedby={error ? "reset-password-error" : undefined}
          />
        </div>

        {error ? (
          <div id="reset-password-error" className="login-error" role="alert" data-testid="reset-password-error">
            {error}
          </div>
        ) : null}

        <Button type="submit" className="login-submit" disabled={loading} data-testid="reset-password-submit">
          {loading ? "Resetting…" : "Reset password"}
        </Button>
      </form>

      <p className="login-register-prompt fade-up delay-2">
        <Link to="/login">Return to sign in</Link>
      </p>
    </AuthenticationShell>
  );
}
