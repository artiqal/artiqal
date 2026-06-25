import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const sessionId = params.get("session_id");
    if (!sessionId) {
      navigate("/login");
      return;
    }

    (async () => {
      try {
        const { data } = await api.post("/auth/google/session", { session_id: sessionId });
        setUser(data);
        // Strip the hash and go to dashboard
        window.history.replaceState({}, document.title, "/dashboard");
        navigate("/dashboard");
      } catch (err) {
        setError("Could not complete Google sign-in. Please try again.");
        setTimeout(() => navigate("/login"), 1800);
      }
    })();
  }, [navigate, setUser]);

  return (
    <div data-testid="auth-callback" className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="font-display text-lg">Finishing sign-in…</div>
        {error ? <div className="mt-3 text-sm text-rose-600">{error}</div> : null}
      </div>
    </div>
  );
}
