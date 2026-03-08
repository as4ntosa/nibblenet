# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
```

No test runner is configured beyond Playwright (no `npm test` script). Playwright tests can be run with `npx playwright test`.

## Architecture

**ShareBite** is a food surplus marketplace — a client-side Next.js 14 app (App Router) with no backend. All data is mocked and persisted via `localStorage`.

### State Management

Two React Contexts power the app:

- `AuthContext` (`src/context/AuthContext.tsx`) — user session, role, localStorage persistence. Methods: `login`, `signup`, `logout`, `updateProfile`, `setRole`.
- `DataContext` (`src/context/DataContext.tsx`) — listings and reservations via `useReducer`. All filtering/searching is done in-memory on the client.

### Route Groups & Roles

Users have one of two roles which determines their routing:

- **Consumer** routes live under `src/app/(consumer)/` — home feed, search, listing detail, reservations, profile
- **Provider** routes live under `src/app/(provider)/` — dashboard, listings management, create listing, provider profile
- Auth routes: `/login`, `/onboarding`

### Key Conventions

- Path alias `@/*` maps to `src/*`
- Tailwind utility classes merged via `cn()` from `src/lib/utils.ts` (wraps `clsx` + `tailwind-merge`)
- Custom green brand palette defined in `tailwind.config.js`
- Mobile-first layout; `iPhoneFrame` component wraps content for desktop preview
- Remote images only from `images.unsplash.com` (configured in `next.config.js`)
- Mock data lives in `src/lib/mock-data.ts`; shared types in `src/types/index.ts`
