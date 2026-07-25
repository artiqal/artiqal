import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/GoogleButton";
import { AuthenticationShell } from "@/components/auth/AuthenticationShell";
import { isLocalPreviewAccessEnabled } from "@/lib/previewAccess";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const previewAccessEnabled = isLocalPreviewAccessEnabled();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data);
      navigate("/dashboard");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticationShell
      heading="Welcome back!"
      headingId="login-heading"
      pageTestId="login-page"
      supportingText="Sign in to access your artiqal workspace."
    >
      <div className="login-google fade-up delay-1">
        <GoogleButton />
      </div>

      <div className="login-divider fade-up delay-1" aria-hidden="true">
        <span>or continue with email</span>
      </div>

      <form onSubmit={submit} className="login-form fade-up delay-2" data-testid="login-form">
        <div className="login-field">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={error ? "login-error" : undefined}
            data-testid="login-email-input"
          />
        </div>
        <div className="login-field">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={error ? "login-error" : undefined}
            data-testid="login-password-input"
          />
          <Link to="/forgot-password" className="login-forgot-link" data-testid="login-forgot-password-link">
            Forgot password?
          </Link>
        </div>

        {error ? (
          <div id="login-error" className="login-error" role="alert" data-testid="login-error">
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="login-submit"
          data-testid="login-submit-btn"
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {previewAccessEnabled ? (
        <div className="login-preview-access fade-up delay-3" data-testid="login-preview-access">
          <div className="login-divider" aria-hidden="true">
            <span>local preview</span>
          </div>
          <Link to="/dashboard" className="login-preview-button" data-testid="login-preview-access-link">
            Continue to clinician hub
          </Link>
          <p>Available only while working in this local preview.</p>
        </div>
      ) : null}

      <p className="login-register-prompt fade-up delay-3">
        Don’t have an account?{" "}
        <Link to="/register" data-testid="login-to-register-link">
          Start your free trial
        </Link>
      </p>
    </AuthenticationShell>
  );
}
