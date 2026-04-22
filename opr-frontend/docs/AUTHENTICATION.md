## Authentication — OPR Frontend

Comprehensive auth guide covering OTP, Google OAuth (PKCE), token and session lifecycle, API header usage, CSRF, security, testing, and operational concerns.

Audience
- Frontend engineers implementing auth flows
- Backend engineers coordinating token/session contracts
- Security and QA teams verifying authentication behavior

Contents
- OTP verification process
- Google OAuth integration (recommended PKCE flow)
- Token management and rotation
- Session handling and cookie considerations
- API authentication headers (`__Pearl_Token`) and usage
- CSRF, session fixation, and security checklist
- Testing and monitoring strategies

---

1) OTP verification process (detailed)

Purpose
- OTPs (one-time passcodes) provide a short, simple factor for passwordless or 2FA flows. They should be short-lived and single-use.

Typical flow
1. User requests OTP by providing an email or phone number: frontend calls POST /api/auth/otp/send with { target: 'email'|'sms', address }.
2. Backend creates an OTP entry (store in Redis with ttl), sends OTP through provider (SMTP/SMS) and returns an `otpRequestId`.
3. User enters code into UI. Frontend calls POST /api/auth/otp/verify with { otpRequestId, code }.
4. Backend verifies code and issues a session: it may set an httpOnly cookie and/or return a short-lived access token.

Security best practices
- TTL: keep code validity small (e.g., 5 minutes).
- Single-use: mark OTP as consumed on the first successful verification.
- Rate limiting: throttle send requests (per IP and per user) and retry policies.
- Logging: do not log raw OTPs; log events (send, verify success/failure) with requestId.

UX recommendations
- Show a countdown timer for the OTP and disable resend for a short backoff period.
- Provide clear messaging on send delays and delivery channels.

Provider choices
- Use a reputable transactional SMS/Email provider (Twilio, SendGrid, AWS SES).
- For test environments, provide a dev-only sink (console or log) to capture OTPs.

---

2) Google OAuth integration (server-assisted + PKCE)

Why PKCE?
- PKCE improves security for public clients (SPAs) by avoiding exposing client secrets. We recommend PKCE for any in-browser OAuth flows.

Server-assisted PKCE flow (recommended)
1. Frontend constructs `code_verifier` and `code_challenge` locally (SHA256->base64url). Store `state` and `code_verifier` in memory or short-lived storage.
2. Redirect user to backend route `/api/auth/google` (or directly to Google with params); backend includes `state` and `code_challenge`.
3. Google returns to backend callback with `code`. Backend exchanges `code + code_verifier` for tokens.
4. Backend creates a session (httpOnly cookie) and redirects to frontend with a short-lived success page. Frontend then calls `/api/auth/me` to fetch profile.

Notes
- Keeping token exchange on the server hides client secret and refresh token from the browser.
- Backend can set a secure, httpOnly cookie that the frontend will send automatically with `credentials: 'include'`.

Edge cases & account linking
- If the returned email matches an existing account with different auth, show a linking flow.
- Implement email verification steps when linking unverified emails.

---

3) Token management & rotation

Token types and roles
- Access Token: short-lived (e.g., 5–15 minutes) token used to authorize API calls.
- Refresh Token: long-lived token used exclusively by backend to obtain new access tokens.
- `__Pearl_Token`: optional header token for special cases (e.g., server-to-server calls, or cross-origin requests where cookies are problematic).

Storage strategy
- Keep refresh tokens server-side as httpOnly cookies; never expose them to the client.
- Keep access tokens in-memory if needed; avoid localStorage/sessionStorage for tokens.

Rotation strategy
- Refresh tokens can be rotated on each use: when a refresh occurs, issue a new refresh token and invalidate the previous one server-side.
- Enforce bounded lifetime for refresh tokens and require re-authentication after a maximum window.

Handling 401s
- On 401 responses, `lib/api.ts` should attempt a single refresh via POST /api/auth/refresh and retry the failed request once. If refresh fails, redirect to login.

Token revocation
- Provide an endpoint to revoke refresh tokens / logout (POST /api/auth/logout). The server should remove refresh token from store and clear cookie.

---

4) Session handling & cookie configuration

Cookie attributes (recommended)
- `HttpOnly`: true (prevents JS access)
- `Secure`: true (only over HTTPS)
- `SameSite`: Lax or Strict depending on cross-site needs (Lax is commonly acceptable)
- `Path`: `/` and appropriate domain scoping

Session renewal & sliding expiration
- Implement sliding sessions with maximum absolute expiration to reduce risk while providing smooth UX.

Cross-origin considerations
- If frontend and backend are on different domains, set appropriate CORS and ensure `credentials: 'include'` is used.
- For cross-domain cookies, confirm domain scoping and SameSite behavior.

Session security checks
- Re-auth on sensitive operations (changing auth, deleting workflows).
- Rate limit session creation per account and per IP.

---

5) API authentication headers: `__Pearl_Token`

When to use `__Pearl_Token`
- Use when explicit header-based auth is required by an endpoint or when cookies are unavailable (third-party integrations, server-to-server proxies).

How to attach safely

```ts
function attachPearlToken(headers: Headers) {
  const token = (window as any).__PEARL_TOKEN__ || null;
  if (token) headers.set('__Pearl_Token', token);
}
```

Best practice: do not persist `__Pearl_Token` to disk; store it in-memory and refresh via secure server endpoints when necessary.

---

6) CSRF, session fixation and other security mitigations

CSRF
- If using cookies, protect POST/PUT/DELETE endpoints with CSRF tokens. Use double-submit cookie or server-side verified XSRF tokens.
- For APIs accepting `__Pearl_Token`, CSRF is less relevant because header-based tokens are not automatically sent by browsers.

Session fixation
- Regenerate session id on sign-in and privilege elevation.

Brute force & rate limiting
- Enforce account lockouts or exponential backoff for repeated failed logins/OTP attempts.

Secrets management
- Use a secrets manager (Vault, AWS Secrets Manager) for provider credentials and OAuth client secret.

---

7) Testing & QA for authentication

Unit & integration tests
- Use `msw` to mock auth endpoints and simulate OTP flows.
- Test 401->refresh flows and ensure only a single retry is performed.

End-to-end tests
- Use Playwright to test full OAuth redirect flows against a test OAuth client and stubbed network responses.

Security testing
- Perform periodic penetration tests on auth endpoints and ensure rate-limits and token handling are resilient.

---

8) Operational & monitoring guidance

Monitoring
- Instrument auth endpoints with metrics: login success/failure rates, refresh attempts, logout events.
- Raise alerts for spikes in failed OTP attempts or refresh failures.

Logging
- Log events with requestId but avoid logging tokens or OTP codes.

Incident response
- If tokens are compromised, revoke refresh tokens and force re-auth for affected users.

---

Appendix: sample API specs

POST /api/auth/otp/send
Request: { target: 'email'|'sms', address: '...' }
Response: { otpRequestId: 'otp-abc', ttlSecs: 300 }

POST /api/auth/otp/verify
Request: { otpRequestId: 'otp-abc', code: '123456' }
Response: { user: { id, email }, token?: '<access-token>' }

POST /api/auth/refresh
Request: cookies only
Response: 200 with new cookie or { token: '<new-access-token>' }

POST /api/auth/logout
Request: cookies only
Response: 204 No Content

---

Document created: `opr-frontend/docs/AUTHENTICATION.md`
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


