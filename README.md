# JARVIS AI

A production-ready multimodal AI voice assistant platform. JARVIS AI combines voice interaction, large language models, agentic workflows, memory systems, and vision AI into a unified, futuristic operating-system-like experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-19.2-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.8-3178c6.svg)

## Overview

JARVIS AI is inspired by Siri, Alexa, and ChatGPT Voice Mode. It provides an advanced interface where users can converse naturally, delegate tasks to autonomous agents, manage long-term memory, and control automation workflows — all within a premium dark glassmorphism UI.

## Features

- **Voice Interface** — Real-time speech with animated waveform visualizations, multilingual support (English, Telugu, Hindi), and transcription.
- **Chat Workspace** — Persistent threaded conversations with rich message rendering.
- **Agent Control Center** — Deploy autonomous Planner and Research agents powered by LangGraph workflows.
- **Memory Center** — Semantic long-term memory powered by pgvector embeddings.
- **Automation Center** — File management, app control, and scheduled workflow execution.
- **Coding Workspace** — Syntax-highlighted code snippets and AI-pair programming tools.
- **Vision AI** — Webcam and screen analysis with multimodal understanding.
- **Research Hub** — Deep-web search, document synthesis, and citation management.
- **Productivity Hub** — Task management, calendar integration, and meeting summaries.
- **Analytics Dashboard** — Real-time system metrics and user activity visualization via Recharts.
- **Settings** — Full theme, voice, agent, and integration configuration.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start v1 (React 19 + Vite 8 + SSR/SSG) |
| Styling | Tailwind CSS v4 with custom OKLCH color tokens |
| UI Components | Radix UI primitives + shadcn/ui |
| Animations | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| State | TanStack Query |
| Routing | TanStack Router (file-based) |

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── AppShell.tsx          # Main navigation shell (sidebar + header)
│   └── ui-kit/
│       ├── cards.tsx             # GlassCard, StatCard components
│       └── voice.tsx             # VoiceOrb, Waveform visualizations
├── routes/
│   ├── __root.tsx                # Root layout with providers
│   ├── index.tsx                 # Dashboard (Mission Control)
│   ├── voice.tsx                 # Voice interaction page
│   ├── chat.tsx                  # Chat workspace
│   ├── memory.tsx                # Memory center
│   ├── agents.tsx                # Agent control center
│   ├── automation.tsx            # Automation hub
│   ├── coding.tsx                # Coding workspace
│   ├── vision.tsx                # Vision AI hub
│   ├── research.tsx              # Research center
│   ├── productivity.tsx          # Productivity hub
│   ├── analytics.tsx             # Analytics dashboard
│   └── settings.tsx              # Settings page
├── components/ui/                # shadcn/ui components (auto-generated)
├── styles.css                    # Global theme, glassmorphism utilities
└── ...
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd jarvis-ai

# Install dependencies
bun install

# Start the development server
bun run dev
```

The application will be available at `http://localhost:3000`.

### Build for Production

```bash
bun run build
```

### Lint & Format

```bash
bun run lint
bun run format
```

## Design System

JARVIS AI uses a custom futuristic dark theme built on OKLCH color tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `--electric-blue` | `oklch(0.65 0.2 250)` | Primary actions, links |
| `--neon-purple` | `oklch(0.55 0.25 300)` | Accent gradients, highlights |
| `--cyan` | `oklch(0.7 0.18 195)` | Secondary accents, status |
| `--bg-base` | `oklch(0.08 0.02 260)` | Deep background |

Custom utility classes:
- `.glass` — frosted glass surface
- `.glass-strong` — elevated glass with stronger blur
- `.shadow-glow` — neon glow shadow for interactive elements

## Roadmap

- [ ] Backend integration (FastAPI + PostgreSQL + pgvector)
- [ ] AI model wiring (GPT-4o, Whisper, ElevenLabs)
- [ ] LangGraph agent workflows
- [ ] LiveKit real-time voice
- [ ] Mapbox location services
- [ ] Authentication & user roles
- [ ] PWA support

## License

MIT © JARVIS AI Team
