## Troubleshooting — OPR Frontend

This document lists common issues and suggested fixes for frontend developers and SREs.

Common problem categories
- Build errors
- API connection issues
- Authentication problems
- Performance tips

1) Build errors

Symptoms
- `pnpm build` fails with TypeScript or webpack errors.

Quick fixes
- Run `pnpm install` to ensure dependencies are installed.
- Run `pnpm lint --fix` and `pnpm format` to fix style-related issues.
- Investigate TypeScript errors and follow the `tsconfig.json` strictness settings.

Node version mismatch
- Use `.nvmrc` or `volta` to ensure correct Node version. Switch to the project's Node LTS.

Dependency conflicts
- Remove `node_modules` and lockfile and reinstall (`pnpm install --force`).

2) API connection issues

Symptoms
- Network errors when calling backend endpoints, CORS errors in browser console, or 401/403 responses.

Checklist
- Verify `NEXT_PUBLIC_API_BASE_URL` is correctly set.
- Check browser console for CORS errors; ensure backend includes appropriate `Access-Control-Allow-Origin` header and allows credentials if using cookies.
- Check that `lib/api.ts` is attaching credentials/headers as expected (`credentials: 'include'` for cookies, or `__Pearl_Token` header when needed).

Server unreachable
- Confirm backend is running locally (e.g., via `docker compose ps`) and ports are not blocked by firewall.

Unauthorized (401)
- Check session cookies and token expiry. Use devtools to inspect cookies and request headers.
- If 401 occurs on refresh attempts, clear cookies and re-authenticate.

3) Authentication problems

OTP not delivered
- Ensure the backend is configured with an SMS/email provider and credentials.
- Check backend logs for delivery errors and rate-limiting issues.

OAuth redirect issues
- Confirm the OAuth client redirect URI matches the configured value in Google Cloud Console and the backend.
- If using localhost, ensure correct ports (http://localhost:3000) and that dev redirect URIs are configured.

Session loops
- 401 -> refresh -> 401 loops usually mean refresh endpoint is misconfigured or cookies are not being sent (check SameSite, Secure flags).

4) Performance optimization tips

Slow editor load
- Lazy-load the editor module (`dynamic` import in Next.js with ssr:false).
- Use code-splitting for large third-party libraries.

Slow rendering with many nodes
- Virtualize node lists and logs. Ensure large arrays are memoized and not re-created on every render.

Large network payloads
- Compress responses on backend and paginate logs.

5) Debugging runtime failures

Use `GET /api/executions/:id` to fetch an authoritative snapshot.

Collecting useful info for support
- X-Request-Id (if available) from response headers.
- Browser console logs and network traces (HAR file).
- Steps to reproduce and sample workflow JSON via `serializeWorkflowData`.

6) Known pitfalls and how to avoid them

- Do not import editor packages directly into landing page components (lazy-load instead).
- Watch out for heavy synchronous tasks in render (move to web worker if needed).

7) When to escalate to backend team

- Persistent 500 errors for runs — provide executionId and requestId.
- Delivery failures for OTP/email — share provider logs and request IDs.

8) Contact & support info

- Add project-specific support contacts here (frontend, backend, infra).

