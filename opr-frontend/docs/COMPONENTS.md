# OPR Frontend — Components Reference

Purpose
-------
This document catalogs the React components used in the landing pages and UI of the OPR frontend. It focuses on the landing page set (Header, Hero, WorkflowDemo, Features, Creator, Footer), their props and usage patterns, styling conventions (Tailwind CSS), accessibility considerations, and how we reuse components from the `shadcn/ui` library.

Scope
-----
- Landing page components located under `src/app/_landingPage/`.
- Reusable UI primitives in `src/components/ui/`.
- Styling and design tokens (Tailwind classes, theme provider).
- How to add or change components and maintain consistency.

Audience
--------
This doc is for frontend engineers, designers collaborating on UI details, and reviewers who want to understand expected props, usage patterns, and styling rules.

How to read this doc
--------------------
- Component sections list props, default values, TS/JS examples, and recommended testing.
- Styling sections include Tailwind utility patterns and common class names used across the app.
- Reusable components section lists the commonly used `shadcn/ui` components and how they are wrapped in our project.

Files & locations to inspect
---------------------------

- Landing components: `src/app/_landingPage/*` (Header, Hero, features, creator, workflow-demo, footer)
- Page that composes the landing: `src/app/page.tsx`
- UI primitives: `src/components/ui/*`
- Higher-level components and panels: `src/components/*`
- Theme & provider: `src/provider/themeprovider.tsx` (or `themeprovider.tsx`)

Naming conventions
------------------

- Component filenames: PascalCase with `.tsx` extension (e.g., `Hero.tsx`).
- Props interface: exported as `HeroProps` (or `{ComponentName}Props`).
- Tests: `__tests__` adjacent to component when feasible or in `src/__tests__/`.

Accessibility conventions
-------------------------

- Use semantic HTML (header, main, nav, footer).
- Provide alt text for images and icons.
- Ensure interactive elements have keyboard focus states and aria attributes.
- Color contrast should meet WCAG AA for normal text by default.

---

Landing page components overview
-------------------------------

This section documents each landing page component, the props they accept, usage examples, and notes on styling and behavior.

1) Header
----------

Location: `src/app/_landingPage/header.tsx` or `src/components/Header.tsx` (depending on repo structure)

Purpose
- Primary navigation container for the landing pages; contains logo, main navigation links, and auth controls (Sign in / Sign up).

Props (TypeScript example)

```ts
export interface HeaderProps {
  logo?: React.ReactNode; // custom logo node, default is project SVG
  links?: { href: string; label: string }[]; // nav links
  onSignIn?: () => void;
  onSignUp?: () => void;
  compact?: boolean; // when true, uses smaller paddings for mobile banner
}
```

Usage example

```tsx
<Header
  logo={<Logo />}
  links={[{ href: '/flow', label: 'Flow' }, { href: '/docs', label: 'Docs' }]}
  onSignIn={() => openLogin()}
  onSignUp={() => openSignup()}
/>
```

Behavior notes
- Mobile: the header collapses to a hamburger menu (ARIA: button with aria-expanded).
- Auth controls read from `userprovider` to show user avatar when signed in.

Styling
- Tailwind utilities used: `flex`, `items-center`, `justify-between`, `px-6`, `py-4`, `bg-white/neutral`, `dark:bg-black/neutral`.

Testing
- Snapshot test for desktop and mobile.
- Accessibility test: ensure the nav is keyboard accessible and aria attributes exist.

2) Hero
-------

Location: `src/app/_landingPage/hero.tsx`

Purpose
- Primary landing hero: headline, subheading, CTA buttons, and a small visual (illustration or WorkflowDemo preview).

Props (TypeScript example)

```ts
export interface HeroProps {
  title: React.ReactNode | string;
  subtitle?: React.ReactNode | string;
  ctas?: { label: string; href?: string; onClick?: () => void; kind?: 'primary' | 'secondary' }[];
  preview?: React.ReactNode; // small visual/worfklow demo
  className?: string;
}
```

Usage example

```tsx
<Hero
  title="Build AI Workflows visually"
  subtitle="Orchestrate LLMs, APIs, and data transforms with a drag-and-drop canvas"
  ctas={[{ label: 'Get started', href: '/flow', kind: 'primary' }, { label: 'Learn more', href: '/docs' }]}
  preview={<WorkflowDemo compact />}
/>
```

Styling
- Layout: responsive two-column on desktop (`grid grid-cols-2 gap-8`), stacked on mobile.
- Headline: `text-4xl md:text-6xl font-extrabold leading-tight`.
- CTA primary: `bg-indigo-600 text-white px-6 py-3 rounded-md`.

Accessibility
- Ensure headings use `h1` on the landing page and `aria-label` on CTAs when necessary.

3) WorkflowDemo
----------------

Location: `src/app/_landingPage/workflow-demo.tsx` or `src/components/WorkflowDemo.tsx`

Purpose
- Shows an animated or interactive preview of the workflow canvas. Often used as a visual in the Hero section.

Props

```ts
export interface WorkflowDemoProps {
  compact?: boolean; // smaller preview
  autoplay?: boolean; // if demo contains animation
  onOpenFullEditor?: () => void; // callback when user clicks "Open"
}
```

Usage example

```tsx
<WorkflowDemo compact autoplay onOpenFullEditor={() => router.push('/flow')} />
```

Notes
- Keep the demo lightweight: avoid bundling full editor logic for the demo. Use a simplified read-only canvas or a pre-rendered GIF/MP4 when possible.
- If interactive, ensure keyboard interactions don't trap focus.

4) Features
-----------

Location: `src/app/_landingPage/features.tsx`

Purpose
- List product features as cards or grid items. Each feature is a small component with icon, title, and description.

FeatureCard props example

```ts
export interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  cta?: { label: string; href?: string };
}
```

Usage example

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <FeatureCard icon={<IconLightning />} title="Fast prototyping" description="Build and iterate quickly." />
  <FeatureCard icon={<IconShield />} title="Secure" description="Enterprise-grade controls." />
</div>
```

Styling
- Use consistent card sizes: `p-6 border rounded-lg shadow-sm` and `hover:shadow-md`.

5) Creator
----------

Location: `src/app/_landingPage/creator.tsx`

Purpose
- A short feature that highlights creators or testimonials; may include embedded videos or profiles.

Props

```ts
export interface CreatorProps {
  profile?: { name: string; role?: string; avatar?: React.ReactNode }[];
  highlight?: React.ReactNode; // promo or video
}
```

Usage example

```tsx
<Creator profile={[{ name: 'Ada Lovelace', role: 'Engineer' }]} highlight={<VideoClip src="/promo.mp4" />} />
```

Notes
- Keep autoplay videos muted by default and accessible controls available.

6) Footer
---------

Location: `src/app/_landingPage/footer.tsx`

Purpose
- Site-wide footer with links, copyright, social icons, and small legal links.

Props

```ts
export interface FooterProps {
  sections?: { title: string; links: { href: string; label: string }[] }[];
  copyright?: string;
}
```

Usage example

```tsx
<Footer sections={[{ title: 'Product', links: [{ href: '/flow', label: 'Flow' }] }]} copyright="© 2026 OPR" />
```

Styling
- Use `bg-slate-50 dark:bg-slate-900` and `text-sm` for legal links. Respect reduced motion preferences for any animated icons.

---

Component props and usage patterns (general guidance)
----------------------------------------------------

1) Prefer explicit props vs implicit context for landing components

- Landing components are primarily stateless and accept props so they can be rendered in multiple contexts (preview, storybook, tests).

2) TypeScript interfaces

- Export a Props interface for every component. This improves discoverability and makes tests easier.

3) Default props & sensible fallbacks

- Provide sensible defaults for optional props. For example, `ctas` default to an array that includes a single `Get started` primary CTA.

4) Composition over inheritance

- Landing components should accept `children` and `className` to allow small variations without changing the component.

Example pattern

```tsx
// component
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 bg-white rounded-lg ${className}`}>{children}</div>;
}

// usage
<Card className="hover:shadow-lg"> ... </Card>
```

---

Styling conventions (Tailwind CSS)
---------------------------------

This project uses Tailwind CSS for utility-first styling. The following conventions help keep styles predictable and maintainable.

Utility ordering & linting

- Use `prettier-plugin-tailwindcss` to order utilities consistently.
- Use `eslint-plugin-tailwindcss` if available to catch unknown classes.

Design tokens & theme

- Keep color choices inside Tailwind configuration (tailwind.config.js). Use semantic names where possible: `bg-primary`, `text-muted`.
- Dark mode is enabled using `class` strategy via a `themeprovider` (e.g., `dark` class on document root).

Spacing scale

- Prefer Tailwind spacing scale (px, 1, 2, 4, 6, 8, 12, 16). Avoid arbitrary pixel values except for one-off exceptions.

Responsiveness

- Use mobile-first breakpoints: `sm:`, `md:`, `lg:`, `xl:`.
- For major layout changes, prefer CSS Grid (`grid grid-cols-...`) and for small lists, use `flex` with `gap-x-*`.

Common class groups

- Buttons: `inline-flex items-center justify-center px-4 py-2 rounded-md font-medium` plus color tokens.
- Cards: `p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm`.
- Headings: `text-3xl md:text-5xl font-extrabold leading-tight`.

Animation & reduced motion

- Respect `prefers-reduced-motion` by disabling non-essential motion for users who prefer reduced motion.
- Keep animations subtle and performant (transform & opacity only).

CSS isolation

- Prefer component-level classes and avoid global styles unless they are design tokens. If you need global overrides, place them in `globals.css`.

Dark mode

- Use Tailwind's `dark:` variant for color changes. Example: `bg-white dark:bg-black`.

---

Reusable UI components (shadcn/ui)
---------------------------------

The project uses `shadcn/ui` components (a popular headless/styled component set) for fast, accessible primitives. We wrap or re-export a small subset to standardize styles and props.

Commonly used shadcn/ui components

- Button / button variants — primary, secondary, ghost
- Input / Textarea — form controls with built-in styling
- Select / Combobox — accessible list controls
- Dialog / Modal — overlays and dialogs
- Tooltip / Popover — small overlays for helper text
- Avatar — user avatar component
- Card / Badge / Checkbox / Switch — small UI building blocks

How we use them

- Wrap shadcn components to add project-specific theme tokens. For example, `src/components/ui/Button.tsx` re-exports the shadcn `Button` with `className` presets for `primary` and `ghost` variants.
- Add TypeScript types that reflect our domain props (for example, Button props may accept `size?: 'sm'|'md'|'lg'` and `loading?: boolean`).

Example Button wrapper (simplified)

```tsx
import { Button as ShadButton } from 'shadcn/ui';

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  const className = variant === 'primary' ? 'bg-indigo-600 text-white' : 'bg-transparent';
  return <ShadButton className={className} {...props} />;
}
```

Accessibility notes

- shadcn components emphasize accessibility; when wrapping them, preserve aria-related props and roles.

Testing wrappers

- Because wrappers are small, unit tests should verify that the correct className and props are forwarded to the underlying shadcn component.

---

Component patterns and examples
-------------------------------

Pattern: Presentational + Container split

- For complex components (e.g., workflow demo), split into a presentational component and a container which provides data via hooks.

Example:

```
WorkflowDemoContainer.tsx  // uses hooks to load preview data
WorkflowDemo.tsx           // purely presentational, accepts props only
```

Pattern: Slots & composition

- Use `children` or named slots for flexible content injection, e.g., `Card.Header`, `Card.Body`, `Card.Footer`.

Pattern: Small focused props

- Prefer many small boolean props (compact/variant/outlined) rather than a large monolithic config object for visual tweaks.

---

Props documentation style (recommended)
--------------------------------------

- For each component, include a short example at the top of the file in a comment block showing common usage.
- Export the Props interface and include JSDoc comments for each prop. Example:

```ts
/**
 * Hero component
 * @example
 * <Hero title="..." ctas={[{label: 'Start'}]} />
 */
export interface HeroProps {
  /** Headline content */
  title: React.ReactNode;
  /** Optional subtitle */
  subtitle?: React.ReactNode;
}
```

---

Testing and Storybook
---------------------

Unit tests
- Test presentational components with React Testing Library. Mock hooks for container components. Verify accessibility queries (getByRole, getByLabelText).

Storybook
- Add stories for each landing component and common variations (mobile, desktop, dark mode).
- Stories are useful for designers to preview copy & spacing without running the whole app.

Visual regression
- Use Chromatic or Playwright snapshots for critical landing page views.

---

How to add a new landing component (step-by-step)
------------------------------------------------

1. Create a new file under `src/app/_landingPage/YourComponent.tsx`.
2. Export the `YourComponentProps` TS interface and provide a default export for the component.
3. Add styles using Tailwind utilities. Prefer composing utility classes rather than adding CSS files.
4. Add a Storybook story in `src/app/_landingPage/stories/YourComponent.stories.tsx` showing desktop and mobile.
5. Add tests: presentational snapshot + accessibility checks.
6. If component requires icons or shared primitives, add them to `src/components/ui`.
7. Update `src/app/page.tsx` to import and include the new component where appropriate.

Checklist for PR reviewers
-------------------------

- Does the component export a Props interface and default props where appropriate?
- Are Tailwind classes ordered and minimal? (use Prettier plugin)
- Are accessibility attributes present and tested?
- Are stories and unit tests included?
- Does the component avoid pulling in heavy editor logic into the landing bundle?

---

Performance & bundle size guidance
----------------------------------

- Keep the landing bundle small: lazy-load heavy components (e.g., interactive WorkflowDemo) with dynamic import + client-only rendering.
- Avoid importing large charts or editor libraries directly into landing components; show simplified visuals or server-rendered images when possible.

Example lazy-load pattern

```tsx
const WorkflowDemo = dynamic(() => import('./WorkflowDemo'), { ssr: false });

export default function Hero() {
  return (
    <section>
      <WorkflowDemo />
    </section>
  );
}
```

---

Code style & linting
--------------------

- Follow repository ESLint and TypeScript settings.
- Use `prettier-plugin-tailwindcss` for consistent Tailwind utility ordering.
- Keep components small (< 200 lines) where possible. If larger, split into presentational + container.

---

Internationalization (i18n)
---------------------------

- Landing copy should be kept in a single translation file (e.g., `src/locales/en.json`) and referenced using the app's i18n hook/provider.
- Avoid embedding static strings deep inside components; export them as props or use translation keys.

---

Accessibility checklist (for landing pages)
-----------------------------------------

1. All interactive elements are keyboard focusable.
2. Images and icons have accessible names or alt text.
3. Landmark elements (header/main/footer) are present.
4. Color contrast meets WCAG AA.
5. Modal/dialog usage uses appropriate aria attributes and focus trapping.

---

Common component examples
-------------------------

Header (Example)

```tsx
export function Header({ logo, links = [], onSignIn, compact = false }: HeaderProps) {
  return (
    <header className={`w-full ${compact ? 'py-2' : 'py-4'} px-6 flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        {logo ?? <DefaultLogo />}
        <nav className="hidden md:flex gap-4" aria-label="Primary">
          {links.map(l => <a key={l.href} href={l.href} className="text-sm font-medium">{l.label}</a>)}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onSignIn} className="text-sm">Sign in</button>
      </div>
    </header>
  );
}
```

Hero (Example)

```tsx
export function Hero({ title, subtitle, ctas = [], preview, className = '' }: HeroProps) {
  return (
    <section className={`container mx-auto py-20 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-extrabold">{title}</h1>
          {subtitle && <p className="mt-4 text-lg text-muted">{subtitle}</p>}
          <div className="mt-6 flex gap-4">
            {ctas.map(cta => (
              <a key={cta.label} href={cta.href} onClick={cta.onClick} className={`inline-flex items-center px-6 py-3 rounded-md ${cta.kind === 'primary' ? 'bg-indigo-600 text-white' : 'bg-transparent border'}`}>
                {cta.label}
              </a>
            ))}
          </div>
        </div>
        <div>
          {preview}
        </div>
      </div>
    </section>
  );
}
```

---

Maintenance & ownership
------------------------

- Keep this document updated when components are added or modified.
- Assign a component owner (in-code comment and repository docs) for complex components like `WorkflowDemo` or `Header`.

---

Appendix A: Reusable UI component list with recommended wrappers
----------------------------------------------------------------

- Button — wrapper `src/components/ui/Button.tsx` exposing `variant` and `size` props.
- Input / Textarea — wrapper with `label`, `error`, and `helperText` props.
- Select — wrapper that normalizes options to `{ value, label }`.
- Dialog — small wrapper that enforces focus trap and accessible title usage.
- Avatar — project avatar wrapper that accepts `user` object.

Appendix B: Example TypeScript prop interfaces
---------------------------------------------

```ts
export interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  cta?: { label: string; href?: string };
}
```

Appendix C: Example Storybook story
-----------------------------------

```tsx
import Hero from './Hero';

export const Default = () => (
  <Hero title="Hello" subtitle="Sub" ctas={[{label: 'Start'}]} preview={<div style={{height:200, background:'#eee'}}/>} />
);
```

