const LOCAL_PREVIEW_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

export function isLocalPreviewAccessEnabled() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  const isLocalHost = LOCAL_PREVIEW_HOSTS.has(window.location.hostname);

  return isLocalHost && (
    process.env.NODE_ENV === "development"
    || document.documentElement.dataset.livePreview === "true"
  );
}
