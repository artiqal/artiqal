# Concentric Auth Testing

## Email/password JWT auth
- Register: POST /api/auth/register {name, email, password}
- Login: POST /api/auth/login {email, password}
- Me: GET /api/auth/me  (cookie or Bearer)
- Logout: POST /api/auth/logout

Cookies: `access_token` (httpOnly, secure, samesite=none).

## Emergent Google OAuth
- Frontend redirects to https://auth.emergentagent.com/?redirect=<ORIGIN>/dashboard
- Returns to /dashboard#session_id=...
- AppRouter detects hash and renders AuthCallback synchronously
- AuthCallback POSTs /api/auth/google/session {session_id}
- Backend calls https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data, creates/updates user, sets `session_token` cookie

## Unified auth
- get_current_user reads `access_token` JWT first; falls back to `session_token` against `user_sessions` collection.

## Test user (seeded admin)
- admin@concentric.app / Concentric123!
