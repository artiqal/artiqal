import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/GoogleButton";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen" data-testid="login-page">
      <Header />
      <main className="max-w-md mx-auto px-6 py-16">
        <div className="fade-up">
          <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-zinc-600">Sign in to your Concentric hub.</p>
        </div>

        <form onSubmit={submit} className="mt-10 space-y-5 fade-up delay-1" data-testid="login-form">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-display">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
              data-testid="login-email-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-display">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl"
              data-testid="login-password-input"
            />
          </div>

          {error ? (
            <div className="text-sm text-rose-600" data-testid="login-error">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 font-display"
            data-testid="login-submit-btn"
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-zinc-400">
          <div className="flex-1 h-px bg-zinc-200" /> or <div className="flex-1 h-px bg-zinc-200" />
        </div>

        <GoogleButton />

        <div className="mt-8 text-center text-sm text-zinc-600">
          New to Concentric?{" "}
          <Link to="/register" className="text-indigo-600 font-semibold" data-testid="login-to-register-link">
            Create an account
          </Link>
        </div>
      </main>
    </div>
  );
}
