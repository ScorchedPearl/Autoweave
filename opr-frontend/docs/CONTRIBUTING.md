## Contributing — OPR Frontend

Welcome! This document explains how to contribute to the frontend: code style, ESLint setup, TypeScript best practices, testing, and the PR process.

Getting started
- Fork the repository, create a branch with a descriptive name (e.g., `feat/add-llm-node`), and keep commits small and focused.

Code style & formatting
- Use Prettier configuration in the repo. Run `pnpm format` or `npm run format` before submitting PRs.
- Tailwind utilities should be ordered by `prettier-plugin-tailwindcss` to ensure consistent ordering.

ESLint configuration
- The repo includes an ESLint config at the root. Run `pnpm lint` and fix issues prior to PR.
- Key rules:
  - No unused-vars
  - Prefer `const` when variables are not reassigned
  - Strict null checks encouraged (`strict` in tsconfig)

TypeScript best practices
- Export interface types for component props (e.g., `HeaderProps`).
- Keep components typed: avoid `any` unless truly necessary; prefer `unknown` with proper narrowing when unavoidable.
- Use discriminated unions for node types and action types in reducers.

Testing approach
- Unit tests: use React Testing Library for components and jest for pure functions.
- Integration tests: use `msw` to mock API responses for hooks.
- E2E tests: Playwright preferred for critical flows (auth, run, save).

Running tests

```bash
pnpm test
# or
npm run test
```

Pull Request process
- Open a PR against `main` with a descriptive title and link to related issues.
- Include a short summary of your changes, files touched, and any migration steps.
- Ensure CI passes (lint, tests, build) before requesting review.
- Use small, focused PRs. For large changes, create an RFC or design doc and discuss before implementing.

Commit message guidelines
- Use conventional commits (feat:, fix:, docs:, chore:, refactor:). Include a short title and optional body describing the change and why.

Code review checklist (for reviewers)
- Does the implementation follow accessibility guidelines?
- Are unit tests and relevant integration tests included?
- Are there performance considerations for the landing page or editor bundle?
- Are secrets and sensitive values not committed?

Adding a new feature
- Add or update storybook stories for the component.
- Add unit tests for new logic and integration tests for API interactions.
- Update `docs/` (this folder) with brief notes about public-facing changes.

Branching and releases
- Follow trunk-based development; feature branches should be short-lived.
- Release process: tag a release on `main` and trigger CI to publish images or deploy via CD.

Security & dependency updates
- Keep dependencies up-to-date. Use dependabot or similar tools.
- For major dependency upgrades, run a full test and smoke test locally.

Local dev tips
- Use `pnpm dev` for hot-reload. Use `pnpm build` and `pnpm start` to test production build locally.

Accessibility
- Run axe-core checks for landing and editor pages. Ensure proper labels for form fields.

Contact and governance
- Document component owners in code or in a small OWNERS.md file if needed.

