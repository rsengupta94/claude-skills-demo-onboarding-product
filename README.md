# Onboarding L&D Platform — Setup Guide

AI-powered onboarding assistant that transforms hiring data (job descriptions + candidate assessments) into personalized onboarding deliverables using a Claude Skills architecture pattern.

---

## Skills Architecture

The core of this platform is the **Claude Skills** pattern — 8 specialized, composable AI skills orchestrated in a pipeline. Each skill has a single responsibility and a well-defined JSON input/output contract.

```
JD + Assessment Input
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                     Orchestration Pipeline                  │
│                   (server/orchestrator/pipeline.js)         │
│                                                             │
│  Step 1: jd-analyzer        Extract competencies from JD   │
│            │                                                │
│  Step 2: interview-assessor  Parse interview notes OR       │
│          rating-processor    convert 1–5 ratings            │
│            │                                                │
│  Step 3: gap-identifier     Compare role requirements vs    │
│            │                candidate assessment            │
│            │                                                │
│  Step 4: content-mapper     Match gaps → Coursera courses   │
│            │                (parallelized: all gaps at once)│
│            │                                                │
│  ┌─────────┼──────────┐                                     │
│  ▼         ▼          ▼   (Steps 5–7 run in parallel)       │
│  plan-   toolkit-  progress-                                │
│  generator generator generator                              │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
5 Personalized Onboarding Deliverables
```

### The 8 Skills

| Skill | File | Responsibility |
|---|---|---|
| **jd-analyzer** | `claude/skills/jd-analyzer.js` | Extract competencies from a job description; dynamically creates new skill buckets when the JD contains capabilities not in the taxonomy |
| **interview-assessor** | `claude/skills/interview-assessor.js` | Parse unstructured interview notes into a standardized per-competency assessment |
| **rating-processor** | `claude/skills/rating-processor.js` | Convert manual 1–5 competency ratings into the same standardized assessment format |
| **gap-identifier** | `claude/skills/gap-identifier.js` | Compare role requirements against the candidate assessment to produce scored skill gaps with evidence |
| **content-mapper** | `claude/skills/content-mapper.js` | Match each skill gap to relevant Coursera courses from the catalog using semantic descriptions; recommends specific modules |
| **plan-generator** | `claude/skills/plan-generator.js` | Generate a structured 30/60/90 day onboarding plan with goals and milestones per phase |
| **toolkit-generator** | `claude/skills/toolkit-generator.js` | Produce manager support materials: focus areas, check-in conversation prompts by day, and coaching tips |
| **progress-generator** | `claude/skills/progress-generator.js` | Initialize a progress tracking framework with phases, a learning checklist, and skill progression baselines |

### LLM Abstraction Layer

Skills are provider-agnostic. The `server/llm/` layer wraps Gemini and OpenAI behind a common interface:

```
getLLMProvider(config)     ← server/llm/provider.js (factory)
       │
       ├── GeminiProvider  ← server/llm/gemini-provider.js
       └── OpenAIProvider  ← server/llm/openai-provider.js
              │
       LLMProvider (base)  ← server/llm/base-provider.js
```

Switch providers by changing `LLM_PROVIDER` in `.env` — no code changes required.

---

## Prerequisites

- **Node.js v20+** (project developed on v24.14.1 — check with `node --version`)
- **npm** (comes with Node.js)
- **A Gemini API key** — get one at [aistudio.google.com](https://aistudio.google.com)
- **Git**

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/rsengupta94/claude-skills-demo-onboarding-product.git onboarding-platform-project
cd onboarding-platform-project
```

---

## Step 2 — Configure Environment Variables

The `.env` file is gitignored. Create it from the example:

```bash
cp .env.example .env
```

Open `.env` and set these values (minimum required to run):

```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=gemini-2.5-pro
PORT=3000
NODE_ENV=development

# Not in use — leave as-is
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o
```

> The Google-related vars in `.env.example` (`GOOGLE_SERVICE_ACCOUNT_KEY_PATH`, etc.) are unused by the server — leave them out.

---

## Step 3 — Install Backend Dependencies

From the project root:

```bash
npm install
```

---

## Step 4 — Install Frontend Dependencies

```bash
cd app
npm install
cd ..
```

---

## Step 5 — Start the Backend

Open **Terminal 1**, run from the project root:

```bash
npm run dev
```

Expected output:

```
🚀 Coursera Onboarding Platform API running on port 3000
📊 LLM Provider: gemini
🌍 Environment: development
✅ Health check: http://localhost:3000/health
```

Verify it's working:

```bash
curl http://localhost:3000/health
```

---

## Step 6 — Start the Frontend

Open **Terminal 2**:

```bash
cd app
npm run dev
```

Vite will print something like:

```
  VITE v6.3.5  ready in XXXms
  ➜  Local:   http://localhost:5173/
```

---

## Step 7 — Open the App

Navigate to **http://localhost:5173** in your browser.

---

## Directory Structure (Key Folders)

```
onboarding-platform-project/
├── server/               # Express backend (Node.js ES modules)
│   ├── server.js         # Entry point
│   ├── orchestrator/     # 8-step AI pipeline
│   ├── routes/           # API endpoints
│   ├── llm/              # Gemini/OpenAI abstraction layer
│   └── utils/            # File management
├── claude/skills/        # 8 AI skill definitions
├── app/                  # React + Vite frontend
│   └── src/app/
│       ├── components/   # All UI components
│       └── services/     # API client (api.ts)
├── data/
│   ├── courses/          # course-catalog.csv (53 courses)
│   └── skill-taxonomy.json
├── hires/                # Generated plans (gitignored, auto-created on first API call)
├── .env                  # You create this — never committed
└── .env.example          # Template
```

---

## Common Issues

| Problem | Fix |
|---|---|
| Startup prints `LLM Provider: openai` but you configured gemini | `.env` not being loaded — confirm the file is in the project root (not `server/`) |
| `Cannot find module` on backend start | Run `npm install` from project root |
| Frontend blank / network errors in browser console | Check backend is running on port 3000 |
| `EADDRINUSE: port 3000` | Run `lsof -i :3000` to find and kill the blocking process |
| `hires/` missing | Not an issue — auto-created on first request to `/api/employees` |

---

## Switching to OpenAI (Optional)

Edit `.env`:

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-real-key-here
OPENAI_MODEL=gpt-4o
```

Restart the backend. No other changes needed.
