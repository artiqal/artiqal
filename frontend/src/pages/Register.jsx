import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/GoogleButton";
import { AuthenticationShell } from "@/components/auth/AuthenticationShell";

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
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
      heading="Create your account"
      headingId="register-heading"
      pageTestId="register-page"
      supportingText="Start your free trial and set up your artiqal workspace."
    >
      <div className="login-google fade-up delay-1">
        <GoogleButton />
      </div>

      <div className="login-divider fade-up delay-1" aria-hidden="true">
        <span>or continue with email</span>
      </div>

      <form onSubmit={submit} className="login-form fade-up delay-2" data-testid="register-form">
        <div className="login-field">
          <Label htmlFor="register-name">Full name</Label>
          <Input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="register-name-input"
          />
        </div>
        <div className="login-field">
          <Label htmlFor="register-email">Email address</Label>
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="register-email-input"
          />
        </div>
        <div className="login-field">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={error ? "register-error" : "register-password-guidance"}
            data-testid="register-password-input"
          />
          <p id="register-password-guidance" className="login-password-guidance">
            Use at least 6 characters.
          </p>
        </div>
        <div className="login-field">
          <Label htmlFor="register-confirm-password">Confirm password</Label>
          <Input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-describedby={error ? "register-error" : undefined}
            data-testid="register-confirm-password-input"
          />
        </div>

        {error ? (
          <div id="register-error" className="login-error" role="alert" data-testid="register-error">
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="login-submit"
          data-testid="register-submit-btn"
        >
          {loading ? "Creating account…" : "Start your free trial"}
        </Button>
      </form>

      <p className="login-register-prompt fade-up delay-3">
        Already have an account?{" "}
        <Link to="/login" data-testid="register-to-login-link">
          Sign in
        </Link>
      </p>
    </AuthenticationShell>
  );
}
