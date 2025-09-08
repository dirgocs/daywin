# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Database Operations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Launch Prisma Studio for database management
- `npm run db:seed` - Populate database with seed data
- `npm run db:setup` - Generate Prisma client and run seed (full database setup)

### Development and Build
- `npm start` - Start Electron application with Vite dev server and hot reload (main development command)
- `npm run build:ts` - Type-check and compile TypeScript files only
- `npm run dev:db` - Generate Prisma client and run PGlite example

### Testing and Examples
- `npm run pglite:example` - Run PGlite integration example
- `npm run pglite:test` - Generate client and run PGlite smoke test
- No formal test runner configured yet - use manual smoke tests with `npm start`
- For future tests: prefer Vitest for unit tests and Playwright for E2E

### Package and Distribution
- `npm run package` - Package application without installer
- `npm run make` - Build distributables via Electron Forge
- `npm run publish` - Publish application builds

## Project Architecture

### Core Technology Stack
- **Framework**: Electron application with React frontend
- **Database**: PGlite (PostgreSQL in WebAssembly) with Prisma ORM
- **Build System**: Vite with separate configurations for main/renderer/preload
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Language**: TypeScript with strict configuration

### Architecture Overview
**Daywin** is a local-first management system for managing "diaristas" (cleaning service workers) with features including:
- User authentication and role-based access control (RBAC)
- Work day tracking and payroll calculation
- Service tax distribution based on configurable rules
- Period-based closures and reporting

### Key Directories
- `src/` - Application source code
  - `main.js` - Electron main process with database initialization and IPC handlers
  - `renderer.jsx` - React application entry point
  - `preload.js` - Secure bridge between main and renderer processes
  - `components/` - Feature views and UI components (App, Login, Layout, etc.)
  - `components/ui/` - UI primitive components (button.tsx, etc.)
  - `services/database.ts` - PGlite database service and connection management
  - `repositories/` - Data access layer for business entities
  - `lib/`, `hooks/`, `examples/` - Utility functions, React hooks, and example code
- `prisma/` - Database configuration
  - `schema.prisma` - Database schema with business models
  - `migrations/` - Database migration files
  - `seed.ts` - Database seeding script
- `assets/` - Application icons and static files
- `DOCS/` - Project documentation

### Database Schema Design
The application uses a comprehensive PostgreSQL schema with:
- **Core Entities**: Diarista (workers), Funcao (functions/roles), DiaTrabalhado (work days)
- **Financial**: TaxaServico (service taxes), Bonificacao (bonuses), Desconto (discounts)
- **Management**: Periodo (periods), Fechamento (closures), RegrasTaxaServico (tax rules)
- **Security**: User, Role, Permission with full RBAC implementation
- **Audit**: Complete audit trail for all operations

### Build Configuration
The project uses Electron Forge with Vite integration:
- **Main Process** (`vite.main.config.mjs`) - Node.js environment, excludes PGlite from optimization
- **Preload** (`vite.preload.config.mjs`) - Secure bridge configuration
- **Renderer** (`vite.renderer.config.mjs`) - React app with Tailwind CSS, MDX support

### PGlite Integration
- Uses `@electric-sql/pglite` for offline-first PostgreSQL database
- Prisma adapter via `pglite-prisma-adapter` for ORM integration
- Database files stored locally in `daywin.db/` directory
- Full PostgreSQL compatibility with zero-configuration setup

## Important Development Notes

### PGlite Configuration
- PGlite is excluded from Vite optimization in all config files to prevent compilation issues
- Database initialization happens in main process before window creation
- Use `DatabaseService` class for all database operations with proper error handling

### Authentication Flow
- Login system uses bcrypt hashing with session management
- Session timeout of 30 minutes with automatic extension on activity
- Admin user (`admin@daywin.com` / `admin123`) created on first run
- All IPC handlers include authentication checks and audit logging

### UI Framework
- Uses shadcn/ui components with Radix UI primitives
- Tailwind CSS v4 with custom theme configuration
- Path alias `@/*` maps to `./src/*` for clean imports
- React 19 with strict TypeScript configuration

### Security Practices
- Context isolation enabled in preload script
- No Node.js integration in renderer process
- All main-renderer communication through secure IPC
- Input validation on all data entry points

### Development Workflow
1. **Setup**: Ensure Node.js and npm are installed, then run `npm install`
2. **After schema changes**: Always run `npm run db:setup` (or `npm run db:generate` + `npm run db:seed`)
3. **Main development**: Use `npm start` for development with DevTools and hot reload
4. **Database inspection**: Use `npm run db:studio` for web-based database management
5. **PGlite testing**: Check examples in `src/examples/pglite-example.ts` or run `npm run pglite:test`
6. **Code patterns**: Follow existing patterns in repositories for new data access code

## Code Standards and Development Guidelines

### Coding Style & Conventions
- **Language**: TypeScript/JavaScript with React; prefer TypeScript for new code
- **Formatting**: 2 spaces indentation, LF line endings, UTF-8 encoding
- **Components**: PascalCase for React components (e.g., `AppLayout.jsx`)
- **UI Primitives**: Lowercase filenames in `src/components/ui/` (e.g., `button.tsx`)
- **Functions**: Descriptive camelCase naming
- **Imports**: Use path alias `@/*` per tsconfig (e.g., `import { x } from '@/lib/x'`)
- **TypeScript**: `strict` mode enabled - fix type errors, avoid `any`
- **Styling**: Tailwind CSS with `clsx` composition and `tailwind-merge` for deduplication

### Electron Best Practices
- Adhere to Electron security-first approach with context isolation
- Use contextBridge for secure main-renderer communication
- Implement proper error handling with try-catch blocks and audit logging
- Minimize renderer process workload, offload to main process when needed
- Enable hardware acceleration and follow performance optimization patterns
- No Node.js integration in renderer process

### Commit Guidelines
- Follow Conventional Commits format (e.g., `feat:`, `fix:`, `chore:`)
- Keep commit subjects ≤ 50 characters, use imperative mood
- Include clear summary, scope of change, and test instructions in PRs
- Note any database changes (migrations/seeds) in PR descriptions
- Include screenshots/GIFs for UI changes
- Link related issues where applicable

### Security & Configuration
- `.env` file drives Prisma `DATABASE_URL` - do not commit secrets
- Prefer PGlite for local development; use real PostgreSQL for production
- Database migrations belong in `prisma/migrations/`
- Run `npm run db:generate` after schema edits
- Context isolation enabled with no Node.js integration in renderer