# Aether

A production-grade AI system for generating and modifying React UI components using natural language prompts. This project features a 3-agent orchestration pipeline to ensure deterministic, high-quality, and secure code generation.

## 🚀 Features

- **Multi-Agent Orchestration** — Specialized agents (Planner, Generator, Fixer, Explainer) handle each stage of the UI creation pipeline.
- **Deterministic Generation** — Strictly enforces a component whitelist and architectural constraints to ensure predictable, Buble-compatible output.
- **Incremental Modifications** — Supports delta-updates to existing code via AST-aware planning with a live DiffViewer.
- **Safety & Security** — Integrated prompt injection protection (`lib/security/promptGuard.ts`) and Zod schema validation for all API inputs.
- **Version History** — In-memory versioning with one-click rollback to any previous state.
- **Live Preview** — Real-time `react-live` preview panel with a built-in source code viewer.
- **Advanced Mock Mode** — Fully functional demonstration mode that simulates AI logic and generates interactive UIs without an API key.
- **Theme Engine** — Customizable dark/light themes with live CSS variable injection.

## 🛠️ Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 14+ (App Router)          |
| Language    | TypeScript                        |
| Styling     | Tailwind CSS + Vanilla CSS        |
| AI Provider | Google Gemini (`@google/genai`)   |
| Preview     | `react-live` (Buble compiler)     |
| Validation  | Zod                               |
| Icons       | Lucide React                      |

## 🏗️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ayushxt25/Aether
cd Aether
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env.local` file in the project root:

```env
# Google Gemini API Key (get one at https://aistudio.google.com/app/apikey)
AI_API_KEY=your_gemini_api_key_here
```

> **Note:** If `AI_API_KEY` is not set, or if the key is invalid/expired, the system **automatically falls back to Mock Mode** — a deterministic simulation that generates real, interactive UIs without any API calls. Mock Mode is ideal for development and demos.

### 4. Run the development server

```bash
npm run dev
```

### 5. Open the application

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📐 Architecture

```
User Prompt
    │
    ▼
[Planner Agent]       → Generates a structured JSON layout plan
    │
    ▼
[Generator Agent]     → Converts the JSON plan into Buble-compatible JSX
    │
    ▼
[Fixer Agent]         → Post-processes code: strips imports, fixes syntax
    │
    ▼
[Explainer Agent]     → Summarizes what was built and why
    │
    ▼
[VersionStore]        → Stores the version, enables rollback
    │
    ▼
[Live Preview]        → Renders via react-live with UI component scope
```

### Key Constraints (Buble Compiler)

`react-live` uses Buble (not Babel), which does **not** support:
- ES6 `import` / `export` keywords inside rendered code
- TypeScript interfaces, type annotations, or generics
- Arrow functions with implicit return of multi-line JSX in some cases

The Generator and Fixer agents are explicitly prompted to produce **pure JavaScript JSX** without any import statements, as the component scope is injected at runtime.

## 🔒 Security

- **Prompt Guard** (`lib/security/promptGuard.ts`): Blocks prompt injection patterns before any AI call.
- **Zod Validation**: All `/api/*` routes validate request bodies with Zod schemas before processing.
- **No Client-Side Keys**: All AI calls happen server-side in Next.js API routes.

## 📜 License

This project is licensed under the MIT License.
