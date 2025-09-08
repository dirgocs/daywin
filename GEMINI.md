# GEMINI.md - Project Overview

## 🚀 Project Overview

This is a "local-first" desktop application built with Electron, React, and Vite. It uses PGlite (a WebAssembly-based PostgreSQL) and Prisma to provide a complete database solution that runs directly within the application, requiring no external database server. The application is designed as a management system for day laborers ("diaristas"), featuring functionalities for tracking work, managing payments, and handling user authentication with role-based access control (RBAC).

### Key Technologies:

*   **Backend:** Node.js, Electron, PGlite, Prisma
*   **Frontend:** React, Tailwind CSS v4, shadcn/ui, Radix UI
*   **Database:** PostgreSQL (via PGlite)
*   **Build System:** Vite
*   **Language:** TypeScript

### Architecture:

*   **Main Process (`src/main.js`):** Handles window creation, database initialization, and IPC communication for core functionalities like authentication and window management.
*   **Renderer Process (`src/renderer.jsx`):** Renders the React-based user interface.
*   **Database (`prisma/schema.prisma`):** Defines the application's data models, including users, roles, permissions, and business-specific entities.

##  MCPs (Model Context Protocols)

*   **shadcn:** `npx shadcn @latest mcp`
*   **github-chat:** `uvx github-chat-mcp`
*   **sequential-thinking:** `npx -y @modelcontextprotocol/server-sequential-thinking`
*   **fetch:** `uvx mcp-server-fetch`
*   **puppeteer:** `npx -y @modelcontextprotocol/server-puppeteer`
*   **github:** `npx -y @modelcontextprotocol/server-github`
*   **context7:** `npx -y @upstash/context7-mcp --api-key ctx7sk-74547057-39cc-420d-a55f-7cf8704f00d0`
*   **playwright:** `npx -y @executeautomation/playwright-mcp-server`

## 📁 Project Structure

- `src/` – Application code
  - `main.js`: Electron main process entry point.
  - `preload.js`: Secure bridge between the main and renderer processes.
  - `renderer.jsx`: React application entry point.
  - `components/`: Feature-specific React components.
  - `components/ui/`: UI primitives (e.g., Button, Input).
  - `lib/`: Utility functions.
  - `services/`: Core services, such as the `DatabaseService`.
  - `repositories/`: Data access layer for business entities.
  - `hooks/`: Custom React hooks.
  - `examples/`: Example code, such as the PGlite integration test.
- `prisma/` – Database schema, migrations, and seed script.
- `assets/` – Static assets like icons.
- `DOCS/` – Project documentation.
- `forge.config.js`: Electron Forge configuration.
- `vite.*.config.mjs`: Vite build configurations for main, preload, and renderer processes.
- `tailwind.config.js`: Tailwind CSS configuration.
- `.env`: Environment variables (e.g., `DATABASE_URL`).

## 🛠️ Building and Running

### Prerequisites:

*   Node.js and npm

### Installation:

1.  Install the project dependencies:
    ```bash
    npm install
    ```

### Running the Application:

1.  Start the application in development mode:
    ```bash
    npm start
    ```
    This command will automatically:
    *   Start the Vite dev server for hot-reloading.
    *   Launch the Electron application.

### Building for Production:

1.  To package the application for your current platform, run:
    ```bash
    npm run package
    ```

2.  To create a distributable installer, run:
    ```bash
    npm run make
    ```

## 💻 Development Conventions

### Database Management:

*   **Schema:** The database schema is defined in `prisma/schema.prisma`. After making changes to the schema, you need to regenerate the Prisma client.
*   **Generating Prisma Client:**
    ```bash
    npm run db:generate
    ```
*   **Seeding the Database:** The database can be seeded with initial data using the following command:
    ```bash
    npm run db:seed
    ```
*   **Database Setup:** To set up the database for the first time (generate client and seed), run:
    ```bash
    npm run db:setup
    ```
*   **Prisma Studio:** To open a web interface for viewing and editing the database, run:
    ```bash
    npm run db:studio
    ```
*   **PGlite Example:** To run a test script that demonstrates the PGlite integration, use:
    ```bash
    npm run pglite:test
    ```

### Code Style & Naming Conventions:

*   **Language:** TypeScript and JavaScript with a preference for TypeScript (`.ts`, `.tsx`) for new code.
*   **Indentation:** 2 spaces.
*   **Line Endings:** LF.
*   **React Components:** `PascalCase` (e.g., `AppLayout.jsx`). UI primitives are located in `src/components/ui` with lowercase filenames (e.g., `button.tsx`).
*   **Imports:** Use the `@/*` path alias, which maps to the `src` directory (e.g., `import { MyComponent } from '@/components/MyComponent';`).
*   **TypeScript:** `strict` mode is enabled. Avoid using the `any` type.
*   **Styling:** Use Tailwind CSS utility classes. Use `clsx` to conditionally apply classes and `tailwind-merge` to resolve class conflicts.

### Testing Guidelines:

*   There is no formal test runner configured yet. Manual testing is done by running the application with `npm start`.
*   A quick database smoke test can be run with `npm run pglite:test`.
*   If you add tests, **Vitest** is preferred for unit tests and **Playwright** for end-to-end (E2E) tests.

### Commit & Pull Request Guidelines:

*   **Commits:** Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification where possible (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
*   **Pull Requests:** Provide a clear summary of the changes, including screenshots or GIFs for UI modifications. Describe how to test the changes and mention any database modifications.

## 🔐 Security & Configuration

*   **Environment Variables:** The `DATABASE_URL` for Prisma is configured in the `.env` file. Do not commit this file to version control.
*   **PGlite:** PGlite is used for local development. For production builds, a real PostgreSQL server should be used.
*   **Database Migrations:** Migrations are stored in the `prisma/migrations` directory. Remember to run `npm run db:generate` after making schema changes.
*   **IPC Communication:** Communication between the main and renderer processes is handled securely through IPC channels defined in `src/main.js` and exposed via the preload script (`src/preload.js`).

## 🎨 UI Framework

*   The UI is built with **shadcn/ui** components, which are based on **Radix UI** primitives.
*   Styling is done with **Tailwind CSS v4**.
*   The project uses a custom theme configured in `tailwind.config.js`.

## 🔑 Authentication Flow

*   The login system uses **bcrypt** for password hashing and manages sessions with a 30-minute timeout that extends automatically on user activity.
*   On the first run, a default admin user is created with the credentials `admin@daywin.com` / `admin123`.
*   All IPC handlers include authentication checks and audit logging.
