# Repository Guidelines

## Project Structure & Module Organization
- `src/` – app code
  - `main.js` (Electron main), `preload.js`, `renderer.jsx`
  - `components/` (feature views) and `components/ui/` (UI primitives)
  - `lib/`, `services/`, `repositories/`, `hooks/`, `examples/`
- `prisma/` – `schema.prisma`, `migrations/`, `seed.ts`
- `assets/` – app icons and static files
- `DOCS/` – project documentation
- Config: `forge.config.js`, `vite.*.config.mjs`, `vite.config.ts`, `tailwind.config.js`, `.env`

## Build, Test, and Development Commands
- `npm start` – run Electron + Vite in development (hot reload).
- `npm run make` – build distributables via Electron Forge.
- `npm run package` – package app without an installer.
- `npm run publish` – publish application builds.
- `npm run build:ts` – type-check/build TypeScript only.
- `npm run db:generate` – generate Prisma client.
- `npm run db:seed` – seed local database (`prisma/seed.ts`).
- `npm run db:setup` – generate client + seed.
- `npm run db:studio` – open Prisma Studio.
- `npm run dev:db` – generate Prisma client and run PGlite example.
- `npm run pglite:test` – quick PGlite + Prisma smoke test (see `README_PGLITE.md`).
- `npm run pglite:example` – run the PGlite integration example script.

## Setup & Prerequisites
- Ensure Node.js and npm are installed.
- Install dependencies: `npm install`.
- After schema changes, run `npm run db:setup` (or `npm run db:generate` + `npm run db:seed`).

## Coding Style & Naming Conventions
- Language: TypeScript/JS with React; prefer TS/TSX for new code.
- Indentation: 2 spaces; LF line endings; UTF-8.
- React components: PascalCase (e.g., `AppLayout.jsx`). UI primitives live in `src/components/ui` with existing lowercase filenames (e.g., `button.tsx`).
- Imports: use path alias `@/*` per `tsconfig*` (e.g., `import { x } from '@/lib/x'`).
- TypeScript: `strict` enabled—fix type errors, avoid `any`.
- Styling: Tailwind CSS; compose classes with `clsx` and dedupe with `tailwind-merge` when helpful.

## Testing Guidelines
- No formal test runner configured yet. Use `npm start` for manual smoke tests and `npm run pglite:test` for DB quick-checks. If adding tests, prefer Vitest for unit tests and Playwright for E2E.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits where possible (e.g., `feat: …`, `fix: …`, `chore: …`). Keep subjects ≤ 50 chars, imperative mood.
- PRs: include a clear summary, scope of change, screenshots/GIFs for UI changes, test instructions, and note any DB changes (migrations/seeds). Link related issues.

## Security & Configuration Tips
- `.env` drives Prisma `DATABASE_URL`. Do not commit secrets. Prefer PGlite for local dev; use real Postgres for production builds.
- Migrations belong in `prisma/migrations`. Run `npm run db:generate` after schema edits.

## Architecture & Tech Stack
- Electron + React + Vite; TypeScript (strict mode) with Tailwind CSS (shadcn/ui over Radix primitives).
- Local-first DB via PGlite (PostgreSQL in WASM) integrated with Prisma.
- Vite configs split per target: `vite.main.config.mjs`, `vite.preload.config.mjs`, `vite.renderer.config.mjs`.

## Electron Security & IPC
- Enable context isolation in preload; avoid Node integration in renderer.
- Expose renderer APIs only via `contextBridge` and secure IPC channels.
- Validate inputs on all IPC endpoints; include auth checks where applicable.
- Keep heavy work in the main process and use IPC instead of direct renderer access.

## PGlite & Prisma Notes
- Exclude PGlite from Vite optimization in configs to prevent bundling issues.
- Initialize the database in the main process before creating app windows.
- Use a centralized DatabaseService for connections and error handling; database files are stored locally (e.g., `daywin.db/`).
- Use `npm run db:studio` to inspect data and `npm run pglite:test`/`npm run pglite:example` for quick checks.

## Authentication Defaults (Development)
- Seed creates an admin user for initial access (e.g., `admin@daywin.com` / `admin123`). Update/remove in production seeds.
