import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SessionPill } from "@/components/SessionBanner";
import { Toaster } from "@/components/ui/sonner";

import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import CategoryPage from "@/pages/CategoryPage";
import ActivityPage from "@/pages/ActivityPage";
import SFATool from "@/pages/SFATool";
import AllActivities from "@/pages/AllActivities";
import AuthCallback from "@/pages/AuthCallback";
import SessionsList from "@/pages/SessionsList";
import SessionSummary from "@/pages/SessionSummary";
import ExplorePage from "@/pages/ExplorePage";
import ActivitySearchPage from "@/pages/ActivitySearchPage";
import { HubShell } from "@/components/HubShell";

function AppRouter() {
  const location = useLocation();
  // Synchronous OAuth callback detection — must happen before normal routes
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  const routeTree = (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/all-activities"
        element={
          <ProtectedRoute>
            <AllActivities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sfa"
        element={
          <ProtectedRoute>
            <SFATool />
          </ProtectedRoute>
        }
      />
      <Route
        path="/category/:slug"
        element={
          <ProtectedRoute>
            <CategoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity/:category/:slug"
        element={
          <ProtectedRoute>
            <ActivityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <SessionsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions/:sessionId"
        element={
          <ProtectedRoute>
            <SessionSummary />
          </ProtectedRoute>
        }
      />
      <Route path="/explore/:slug" element={<ExplorePage />} />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <ActivitySearchPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );

  const shellPaths = [
    "/dashboard",
    "/all-activities",
    "/sfa",
    "/category/",
    "/activity/",
    "/sessions",
    "/explore/",
    "/search",
  ];
  const usesHubShell = shellPaths.some((path) =>
    path.endsWith("/") ? location.pathname.startsWith(path) : location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  return usesHubShell ? <HubShell>{routeTree}</HubShell> : routeTree;
}

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <SessionProvider>
            <AppRouter />
            <SessionPill />
            <Toaster richColors position="top-center" />
          </SessionProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
