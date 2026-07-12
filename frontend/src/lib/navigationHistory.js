import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const DEFAULT_CLINICIAN_BACK_FALLBACK = "/all-activities";

const SAFE_APP_PATH_PREFIXES = [
  "/activity/",
  "/all-activities",
  "/category/",
  "/dashboard",
  "/explore/",
  "/sessions",
  "/sfa",
];

export const isSafeInAppPath = (path) =>
  typeof path === "string" &&
  path.startsWith("/") &&
  !path.startsWith("//") &&
  SAFE_APP_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix));

export const getLocationSnapshot = (location) => ({
  pathname: location?.pathname || DEFAULT_CLINICIAN_BACK_FALLBACK,
  search: location?.search || "",
  hash: location?.hash || "",
});

const normalizeNavigationTarget = (target) => {
  if (!target) return null;

  if (typeof target === "string") {
    return isSafeInAppPath(target) ? target : null;
  }

  const pathname = target.pathname || "";
  if (!isSafeInAppPath(pathname)) {
    return null;
  }

  return {
    pathname,
    search: target.search || "",
    hash: target.hash || "",
    state: target.state,
  };
};

const targetsSamePage = (target, location) => {
  if (!target || !location) return false;
  const targetPath = typeof target === "string" ? target : `${target.pathname || ""}${target.search || ""}${target.hash || ""}`;
  const currentPath = `${location.pathname || ""}${location.search || ""}${location.hash || ""}`;
  return targetPath === currentPath;
};

export function useSmartBack(fallback = DEFAULT_CLINICIAN_BACK_FALLBACK) {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    const fromTarget = normalizeNavigationTarget(location.state?.from);
    if (fromTarget && !targetsSamePage(fromTarget, location)) {
      navigate(fromTarget);
      return;
    }

    const historyIndex = window.history?.state?.idx;
    if (typeof historyIndex === "number" && historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate(fallback);
  }, [fallback, location, navigate]);
}
