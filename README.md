# Aether

**AI-powered React UI generation workspace for turning prompts into editable product interfaces.**

Aether is a full-stack Next.js workspace that converts natural language prompts into previewable React UIs with persistent project organization, version history, prompt traceability, manual code editing, and export workflows. It is designed for fast interface prototyping without losing the control, auditability, and reusability developers need in a serious product workflow.

[![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Gemini / OpenRouter](https://img.shields.io/badge/Gemini%20%2F%20OpenRouter-AI_Pipeline-1A73E8?style=for-the-badge)](#ai-pipeline)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**Live Demo:** [Aether](https://aether-nine-kappa.vercel.app/)  
**Repository:** [ayushxt25/Aether](https://github.com/ayushxt25/Aether)  
**Screenshots:** See the [Screenshots](#screenshots) section below

## Overview

Aether focuses on a common gap in AI UI tooling: generating code is easy, but iterating on it in a reliable product workflow is usually not.

UI prototyping is often slow because design exploration, implementation, and iteration are split across multiple tools. Many AI-generated UI experiences also stop at one-off output, making it hard to edit code manually, inspect prompt intent, compare versions, or reuse the result in a real application.

Aether brings those workflows together in one workspace:

- Prompt-to-React interface generation
- Live preview and in-browser code editing
- Versioned project history with rollback, duplicate, fork, and delete
- Prompt-run traceability across generated and manually edited states
- Exportable TSX and ZIP outputs for downstream reuse

## Screenshots

Screenshots will be added after final UI capture.

![Landing Page](./screenshots/landing-page.png)
![Workspace Dashboard](./screenshots/workspace-dashboard.png)
![AI UI Generation](./screenshots/ai-ui-generation.png)
![Live Preview](./screenshots/live-preview.png)
![Code Editor](./screenshots/code-editor.png)
![Version History](./screenshots/version-history.png)
![Prompt Runs](./screenshots/prompt-runs.png)
![Project Management](./screenshots/project-management.png)

## Features

| Feature | Description |
| --- | --- |
| Natural language to React UI generation | Turn plain-English product prompts into generated React interfaces. |
| Multi-agent generation workflow | Planner, generator, editor, fixer, and explainer agents shape and stabilize output. |
| Live React preview | Render generated UIs instantly with `react-live` inside the workspace. |
| Manual code editor | Edit generated component code directly and preview changes before saving. |
| Version history | Store project-specific UI versions with explanations and timestamps. |
| Rollback, duplicate, fork, delete | Restore previous states or branch work into new projects without losing progress. |
| Prompt runs / traceability | Review generated, modified, duplicated, forked, and manual runs from a dedicated history view. |
| Project-based workspace | Organize work by user-specific projects backed by PostgreSQL and Prisma. |
| Clerk authentication | Secure sign-in and sign-up flows with user-scoped project access. |
| PostgreSQL persistence | Persist projects, versions, and prompt-run related state through Prisma models. |
| Export generated component as TSX | Download a reusable `GeneratedComponent.tsx` file directly from the workspace. |
| Export ZIP package | Export a small reusable package with component code and metadata. |
| Theme settings | Adjust theme mode, primary color, secondary color, and font family while generating. |
| Responsive polished interface | Includes a production-style landing page, workspace shell, and prompt-runs dashboard. |

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- React Live
- Lucide React

### Backend

- Next.js API routes
- Prisma ORM
- PostgreSQL / Neon

### Authentication

- Clerk

### AI Pipeline

- Gemini
- OpenRouter fallback
- Multi-agent prompt pipeline

### Deployment

- Vercel

## Architecture

At a high level, Aether routes each user prompt through an authenticated, version-aware generation workflow:

1. The user authenticates with Clerk.
2. The user creates or opens a project workspace.
3. A prompt is submitted to a Next.js API route.
4. The AI agent pipeline plans, generates, validates, and explains the React interface.
5. The result is saved as a new version in PostgreSQL through Prisma.
6. The generated component is rendered inside the live preview workspace.
7. Prompt activity is exposed through the Prompt Runs view.
8. The user can manually edit code, restore history, duplicate, fork, delete, or export the result.

```text
+------------------+        +------------------------+        +----------------------+
| Clerk Auth       | -----> | Next.js Workspace UI   | -----> | API Routes           |
| User session     |        | Projects / Preview     |        | /generate /modify    |
+------------------+        +------------------------+        +----------------------+
                                                                      |
                                                                      v
                                                           +----------------------+
                                                           | AI Agent Pipeline    |
                                                           | Planner              |
                                                           | Generator            |
                                                           | Editor / Fixer       |
                                                           | Explainer            |
                                                           +----------------------+
                                                                      |
                                                                      v
                                                           +----------------------+
                                                           | Prisma + PostgreSQL  |
                                                           | Projects             |
                                                           | Versions             |
                                                           | Prompt metadata      |
                                                           +----------------------+
                                                                      |
                                                                      v
                                                           +----------------------+
                                                           | Live Preview /       |
                                                           | Code Editor / Export |
                                                           +----------------------+
```

## Folder Structure

The repository currently centers around a Next.js App Router application with server routes, reusable UI primitives, and database-backed versioning utilities:

```text
Aether/
|-- app/
|   |-- api/
|   |   |-- generate/
|   |   |-- history/
|   |   |-- modify/
|   |   |-- projects/
|   |   |-- rollback/
|   |   |-- runs/
|   |   `-- versions/
|   |-- sign-in/
|   |-- sign-up/
|   |-- workspace/
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|   |-- ui/
|   |-- ChatPanel.tsx
|   |-- DiffViewer.tsx
|   |-- HistorySidebar.tsx
|   |-- PreviewPanel.tsx
|   |-- ProjectSelector.tsx
|   |-- PromptRunsView.tsx
|   `-- ThemeSettings.tsx
|-- lib/
|   |-- agents/
|   |-- client/
|   |-- db/
|   |-- mock/
|   |-- prompts/
|   |-- security/
|   |-- server/
|   |-- state/
|   |-- validation/
|   `-- versioning/
|-- prisma/
|   |-- migrations/
|   `-- schema.prisma
|-- public/
|   `-- screenshots/
|-- scripts/
|-- types/
|-- package.json
`-- README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ayushxt25/Aether.git
cd Aether
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` or `.env.local` file in the project root and add the required values from the section below.

### 4. Generate the Prisma client

```bash
npx prisma generate
```

### 5. Push the schema to your database

```bash
npx prisma db push
```

### 6. Run the development server

```bash
npm run dev
```

Open `http://localhost:3000` after the server starts.

## Environment Variables

Use placeholders only and never commit real secrets.

```env
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/workspace
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/workspace
AI_API_KEY=
```

Notes:

- Do not commit real environment variables.
- The current server implementation reads `AI_API_KEY` in [`lib/agents/llm.ts`](./lib/agents/llm.ts) for Gemini access.
- `OPENROUTER_API_KEY` is used as a fallback provider when Gemini is unavailable.
- `DATABASE_URL` should point to a PostgreSQL-compatible database such as Neon.

## Usage

Using Aether follows a straightforward product workflow:

1. Sign up or sign in with Clerk.
2. Create a new project in the workspace.
3. Enter a prompt describing the interface you want.
4. Preview the generated React UI live in the workspace.
5. Refine it with a follow-up prompt or modification request.
6. Switch to the code editor to make manual changes.
7. Save the result as a new version.
8. Roll back, duplicate, fork, or delete versions as needed.
9. Export the final component as TSX or a ZIP package.

## Sample Prompts

- Create a premium analytics dashboard for a SaaS product
- Design a finance dashboard with KPI cards and charts
- Build a CRM workspace for a startup sales team
- Create a modern landing page for an AI productivity app
- Improve this UI with better spacing, hierarchy, and executive styling

## Deployment

Aether is well-suited to Vercel deployment for the Next.js app layer:

1. Connect the GitHub repository to Vercel.
2. Add all required environment variables in the Vercel dashboard.
3. Set `DATABASE_URL` to your PostgreSQL or Neon instance.
4. Use `npm run build` as the build command.
5. Run `npx prisma db push` before production rollout if your tables have not been created yet.

The repository also includes a `vercel:init-db` script that chains Prisma setup with the production build:

```bash
npm run vercel:init-db
```

## Roadmap

- Custom component library
- Better responsive preview modes
- Team collaboration
- Prompt templates
- Export to full Next.js page
- Component marketplace / library
- Advanced analytics for prompt runs

## Project Status

Aether is actively being improved as a production-grade AI UI generation workspace.

## Author

**Ayush Kumar Giri**

- GitHub: https://github.com/ayushxt25
- LinkedIn: [Add LinkedIn link here](#)
