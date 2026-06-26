# AI UI Generator

A production-grade AI system for generating and modifying React UI components using natural language prompts. This project features a 3-agent orchestration pipeline to ensure deterministic, high-quality, and secure code generation.

## 🚀 Features

- **Multi-Agent Orchestration**: Utilizes specialized agents (Planner, Generator, and Explainer) to handle different stages of the UI creation process.
- **Deterministic Generation**: Strictly enforces a component whitelist and architectural constraints to ensure predictable results.
- **Incremental Modifications**: Supports delta-updates to existing code via AST-aware planning.
- **Safety & Security**: Integrated prompt injection protection and strict schema validation for all AI outputs.
- **Version History**: In-memory versioning allows users to roll back to any previous state.
- **Live Preview & Code Panel**: Built-in Monaco editor for code inspection and a live-updating preview panel.
- **Advanced Mock Mode**: Fully functional demonstration mode that simulates AI logic and generates interactive UIs without an API key.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Premium Aesthetics)
- **Editor**: @monaco-editor/react
- **Preview**: react-live
- **Validation**: Zod

## 🏗️ Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ai-ui-generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env.local` file and add your API keys:
   ```bash
   # Option 1: OpenAI (Paid)
   OPENAI_API_KEY=your_openai_api_key

   # Option 2: Groq (Free Tier - Recommended)
   GROQ_API_KEY=your_groq_api_key
   ```
   *(Note: Link will prioritize OpenAI if both are present. If neither is provided, the system defaults to Mock Mode.)*

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   

## 📐 Architecture

- **Planner**: Converts user intent into a structured UI plan JSON.
- **Generator**: Transforms the JSON plan into clean, whitelisted React code.
- **Explainer**: Provides architectural reasoning and change summaries.
- **VersionStore**: Manages the application state and history.

## 📜 License

This project is licensed under the MIT License.
