import React from "react";

/* REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH */
export function GoogleButton() {
  const onClick = () => {
    // Use the browser's location to derive redirect — never hardcode it.
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="google-signin-btn"
      className="w-full h-12 rounded-full border border-zinc-300 hover:border-indigo-300 hover:bg-indigo-50/40 transition flex items-center justify-center gap-3 font-display font-semibold text-zinc-800"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.27h2.9c1.7-1.56 2.69-3.87 2.69-6.63z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.27c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.34A8.99 8.99 0 0 0 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.95 10.69A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.69V4.97H.96A8.99 8.99 0 0 0 0 9c0 1.45.35 2.82.96 4.03l2.99-2.34z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.5.45 3.43 1.34l2.57-2.57C13.46.89 11.43 0 9 0A8.99 8.99 0 0 0 .96 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"
        />
      </svg>
      Continue with Google
    </button>
  );
}
