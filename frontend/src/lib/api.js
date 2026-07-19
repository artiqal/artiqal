import axios from "axios";

const CONFIGURED_BACKEND_URL = process.env.REACT_APP_BACKEND_URL?.trim();
const DEVELOPMENT_BACKEND_URL = "http://127.0.0.1:8000";
const BACKEND_URL = CONFIGURED_BACKEND_URL
  || (process.env.NODE_ENV === "development"
    ? DEVELOPMENT_BACKEND_URL
    : process.env.REACT_APP_BACKEND_URL);

if (!CONFIGURED_BACKEND_URL && process.env.NODE_ENV === "development") {
  console.warn(
    `REACT_APP_BACKEND_URL is not configured. Falling back to ${DEVELOPMENT_BACKEND_URL} for local development.`,
  );
}

export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
