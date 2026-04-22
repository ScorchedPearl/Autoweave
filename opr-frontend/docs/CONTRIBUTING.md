## Contributing — OPR Frontend

Welcome! This guide covers contribution workflows, code style, ESLint, TypeScript best practices, testing, PR process, and release guidance.

Table of contents
- Getting started
- Code style & formatter
- ESLint & important rules
- TypeScript best practices
- Testing strategy
- Pull request & review process
- Branching, releases, and tagging
- Security reporting & responsible disclosure

Getting started
- Fork the repo, create a local branch `git checkout -b feat/my-feature`.
- Rebase frequently off `main` and keep PRs small and focused.

Code style & formatter
- Prettier is configured at the repo root. Run `pnpm format` before committing.
- Tailwind classes: rely on `prettier-plugin-tailwindcss` to order utilities consistently.
- Commit hooks: `husky` may be used to run lint/format checks locally.

ESLint & important rules
- Run `pnpm lint` to run full lint suite.
- Key rules enforced:
  - `no-unused-vars` — remove unused imports and variables.
  - `@typescript-eslint/no-explicit-any` — minimize use of `any`.
  - `react/jsx-key` — ensure list items have keys.
  - Accessibility rules: prefer `jsx-a11y` recommendations.

Example `.eslintrc` highlights

```json
{
  "extends": ["eslint:recommended", "plugin:react/recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react/react-in-jsx-scope": "off"
  }
}
```

TypeScript best practices
- Enable `strict` mode in `tsconfig.json` when possible. Prefer `unknown` over `any` and narrow types explicitly.
- Export Props interfaces: `export interface HeaderProps { ... }`.
- Use discriminated unions for action types in reducers and node types.
- Keep side-effects in hooks; presentational components should be pure.

Example patterns

Reducers

```ts
type Action = { type: 'update'; payload: Node } | { type: 'delete'; id: string };
function reducer(state: State, action: Action) { switch(action.type) { ... } }
```

Testing strategy (detailed)
- Unit tests: React Testing Library + Jest
  - Components: render shallow components and assert on DOM
  - Utils: pure functions should have fast unit tests
- Integration tests: `msw` to mock backend for hooks and contexts
- E2E tests: Playwright for full flows (auth, save/run/observe)

Test commands

```bash
pnpm test
pnpm test:watch
```

Pull request & review process
- PR title: use conventional commit prefix and short description, e.g., `feat(editor): add node inspector`.
- PR body checklist: summary, design, screenshots (if UI), tests added, migration notes (if needed), risk assessment.
- Required checks: lint and unit tests passing; run smoke tests if relevant.

Review checklist for reviewers
- Run examples locally and verify new flows.
- Check for accessibility regressions.
- Ensure that performance considerations are addressed (lazy-load heavy deps for landing pages).

Branching & release model
- Use short-lived feature branches. Rebase on main and avoid long-lived branches.
- Releases: tag `vX.Y.Z` on `main` and let CI build/publish artifacts.

PR template (example)

```
Title: feat(scope): short description

Summary:
- What changed?

Files changed:
- list

Testing:
- unit tests, integration, e2e

Notes:
- migration steps

```

Commit message examples
- `feat(workflow): add llm node type`
- `fix(api): handle 401 refresh loop`

Security reporting
- For vulnerabilities or secrets accidentally committed, contact security team and follow responsible disclosure. Do not post sensitive info in PRs or issue trackers.

Onboarding & docs
- Add README snippets for complex features and add minimal diagrams for workflow semantics in `docs/`.

Contribution etiquette
- Be respectful in code review. Provide constructive feedback and ask clarifying questions.

---

Document created: `opr-frontend/docs/CONTRIBUTING.md`
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

