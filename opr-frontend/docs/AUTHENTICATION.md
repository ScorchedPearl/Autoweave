## Authentication — OPR Frontend

This document explains authentication mechanisms used by the frontend: OTP verification, Google OAuth integration, token lifecycle, session handling, and API headers including `__Pearl_Token`.

Contents
- OTP verification process
- Google OAuth integration
- Token management
- Session handling
- API authentication headers and best practices

---

OTP verification process

Use case
- Short-lived one-time passcodes (OTP) are used for second-factor verification or passwordless logins.

Typical flow
1. User initiates OTP flow (enter phone/email on UI).
2. Frontend calls POST /api/auth/otp/send with `{ target: 'email|phone', address: '...' }`.
3. Backend queues message (SMS/Email) and returns a temporary reference `otpRequestId`.
4. User submits code -> frontend calls POST /api/auth/otp/verify with `{ otpRequestId, code }`.
5. Backend validates code and returns session token and user profile (or sets httpOnly cookie).

Security considerations
- OTP codes should be short-lived (e.g., 5 minutes) and single-use.
- Throttle OTP send attempts per user and per IP (rate-limiting).
- Store OTP validations in a secure, ephemeral store (Redis).

UX considerations
- Provide clear messages for delivery delays and allow 'resend code' with increasing backoff.
- Show an expiration countdown for the OTP.

---

Google OAuth integration

Flow variant (server-assisted)
- The frontend uses Google OAuth via a server-assisted exchange:
  - Frontend redirects user to backend route `/api/auth/google` which redirects to Google.
  - Google responds to backend callback with an authorization code.
  - Backend exchanges code for tokens and creates a session (httpOnly cookie) and redirects back to the frontend with profile info.

Why server-assisted?
- Safer to keep client secrets and refresh tokens on the server.
- Server can enforce CSRF & redirect checks and issue secure cookies.

Frontend responsibilities
- Provide correct `redirect_uri` and client-side login triggers.
- After redirect back from server, call `GET /api/auth/me` to retrieve user profile.

Edge cases
- Account linking: if the email already exists, show linking UI.
- Consent revocation: handle 401s and provide re-auth flows.

---

Token management

Token types
- Access token: short-lived bearer token used for authorization.
- Refresh token: long-lived token kept server-side (httpOnly cookie) to obtain new access tokens.
- `__Pearl_Token`: optional header token used in some client-server exchanges.

Storage rules
- Access tokens: keep in-memory when feasible.
- Refresh tokens: server-only httpOnly cookies.
- Never store tokens in localStorage.

Refresh strategy
- On 401 responses, attempt POST /api/auth/refresh. If successful, retry the original request once.
- Implement exponential backoff for refresh retries.

Logout
- Call POST /api/auth/logout to revoke tokens and clear server-side session. Frontend should clear in-memory tokens and redirect to the login page.

---

Session handling

Session model
- Prefer cookie-based sessions for web apps. Cookies should be secure, httpOnly, with SameSite=Lax or Strict depending on integration needs.

Session renewal
- Silent refresh endpoint: `POST /api/auth/refresh` will refresh cookies or return a new access token.
- Refresh on background (e.g., when user returns to the tab) to provide smooth experience.

Session expiry UX
- When a session expires, present a modal explaining the session expired and a button to re-authenticate.

---

API authentication headers

Header usage
- Prefer credentials: 'include' and server-set cookie for browser flows.
- If a header token is required, attach `__Pearl_Token: <token>` in memory to requests.

Implementation snippet (safe attach)

```ts
function attachAuthHeaders(headers: Headers) {
  const token = window.__PEARL_TOKEN__ || null;
  if (token) headers.set('__Pearl_Token', token);
}
```

Security checklist
- Use HTTPS for all token exchanges.
- Enforce CSRF protections when cookies are used (double-submit cookie or SameSite header).
- Log and alert on suspicious auth patterns (multiple failed OTP attempts, refresh failures).

---

Testing auth flows

- Mock `POST /api/auth/otp/send` and `/verify` with msw during unit tests.
- For OAuth flows, stub backend exchange endpoints and test redirect handlers.


