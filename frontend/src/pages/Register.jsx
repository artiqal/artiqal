import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/GoogleButton";

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
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
    <div className="min-h-screen" data-testid="register-page">
      <Header />
      <main className="max-w-md mx-auto px-6 py-16">
        <div className="fade-up">
          <h1 className="font-display text-3xl font-bold tracking-tight">Create your hub</h1>
          <p className="mt-2 text-zinc-600">Start practising in less than a minute.</p>
        </div>

        <form onSubmit={submit} className="mt-10 space-y-5 fade-up delay-1" data-testid="register-form">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-display">Your name</Label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl"
              data-testid="register-name-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="font-display">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
              data-testid="register-email-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-display">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl"
              data-testid="register-password-input"
            />
            <p className="text-xs text-zinc-500">At least 6 characters.</p>
          </div>

          {error ? (
            <div className="text-sm text-rose-600" data-testid="register-error">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 font-display"
            data-testid="register-submit-btn"
          >
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-zinc-400">
          <div className="flex-1 h-px bg-zinc-200" /> or <div className="flex-1 h-px bg-zinc-200" />
        </div>

        <GoogleButton />

        <div className="mt-8 text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold" data-testid="register-to-login-link">
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
