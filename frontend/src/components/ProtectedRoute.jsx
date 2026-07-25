import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isLocalPreviewAccessEnabled } from "@/lib/previewAccess";

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const { loading, user } = useAuth();

  if (isLocalPreviewAccessEnabled()) return children;

  if (loading) {
    return <div className="min-h-screen bg-white" aria-label="Checking authentication" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
