## Troubleshooting — OPR Frontend

This guide collects common problems, diagnostic steps, and fixes for frontend developers and SREs. It includes commands to gather logs, reproduce issues, and recommended configurations.

Sections
- Build errors
- API connection issues
- Authentication problems
- Performance and profiling
- Docker and CI issues
- Useful debugging commands and examples

1) Build errors

Symptom
- `pnpm build` or `npm run build` fails with TypeScript or bundler errors.

Diagnostics
- Run `pnpm build` locally and inspect the stack trace.
- Check `tsconfig.json` for `strict` settings that may cause new type errors.

Common fixes
- Install matching Node version via `nvm use` or `volta`.
- Delete `node_modules` and reinstall: `rm -rf node_modules pnpm-lock.yaml && pnpm install`.
- Fix lint/type errors reported by the compiler.

2) API connection issues

Symptoms
- CORS errors in console, 401/403 responses, `fetch` network failures.

Checklist
- Verify `NEXT_PUBLIC_API_BASE_URL` is set and matches backend host/port.
- If using cookies for auth, ensure `credentials: 'include'` is present in `lib/api.ts` requests.
- Check backend CORS headers allow the origin and permit credentials: `Access-Control-Allow-Credentials: true`.

Curl example to debug backend from your machine

```bash
curl -v -H "__Pearl_Token: $PEARL" "$API_BASE/api/workflows/health"
```

3) Authentication problems

Symptoms
- Login loops, 401 errors, OTP not delivered.

Checks
- Inspect browser cookies (DevTools > Application) to verify cookie attributes: Secure, HttpOnly, SameSite.
- For OTPs, review backend logs for provider errors or rate-limiting.

Fixes
- If cookies aren't sent, ensure `fetch` uses `credentials: 'include'` and backend sets correct `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials`.

4) Performance and profiling

Symptoms
- Slow initial paint, heavy bundles, slow editor rendering with large workflows.

Quick profiling
- Use Chrome DevTools Performance tab to record a page reload and analyze main thread activity.
- Use Lighthouse to get suggestions for bundle size and code-splitting.

Common improvements
- Lazy-load heavy modules (editor, workflow demo) with dynamic imports and SSR disabled for those components.
- Memoize expensive calculations (useMemo/useCallback) in render-critical paths.
- Virtualize long lists (logs, node palettes) using react-virtual.

5) Docker & CI issues

Docker build failures
- Rebuild with no cache to ensure clean builds: `docker build --no-cache -t autoweave-frontend .`.

CI flakiness
- Re-run failing jobs. If the failure is deterministic, add a minimal reproducer locally using the same node/container image as CI.

6) Useful command recipes

- View frontend logs (docker):

```bash
docker compose logs -f frontend
```

- Open a shell inside running frontend container:

```bash
docker compose exec frontend /bin/bash
```

- Capture a network HAR from Chrome: DevTools -> Network -> Export HAR with content.

7) When to escalate to backend or infra

- Persistent 500s on run: include executionId, requestId, and a HAR file if possible.
- OTP delivery failures: backend should check provider logs; provide message ids or provider request ids.

8) Debugging examples

Example: 401 refresh loop
1. Inspect network trace for the initial request and the refresh call.
2. Confirm backend returns 200 on refresh and sets cookie; if not, fix refresh endpoint.
3. Confirm the frontend respects the new cookie and retries original request once.

Example: editor renders slowly with 1000 nodes
- Ensure node components are memoized and that lists are virtualized.
- Offload heavy computation (graph layout) to a web worker if necessary.

9) Performance profiling commands

- Use `node --inspect` for server-side profiling and `chrome://inspect` to attach.
- For frontend bundle analysis, run `pnpm build` and analyze `.next/trace` or `next-bundle-analyzer` output.

10) Contact and escalation matrix

- Fill in team contacts and on-call rotation here.

---

Document created: `opr-frontend/docs/TROUBLESHOOTING.md`
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

