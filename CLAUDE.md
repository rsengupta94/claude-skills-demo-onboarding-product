# Coursera Onboarding L&D Partner - AI Demo

## 🎯 Project Overview

**Purpose:** High-stakes demo for Coursera directors showcasing AI-powered professional services capabilities.

**What it does:** Transforms hiring data (job descriptions + candidate assessments) into 5 personalized onboarding deliverables using "Claude Skills" architecture pattern.

**Demo Context:**
- Audience: Coursera senior directors
- Goal: Showcase both business value (personalized onboarding) and technical sophistication (Claude Skills orchestration)
- Scope: Functional end-to-end demo, not production-ready

**Tech Stack:**
- **Backend:** Node.js + Express (ES modules), Node.js v24.14.1
- **Frontend:** React + Vite + TailwindCSS + React Router 7 + Radix UI (from Figma)
- **AI:** Gemini 2.5 Pro (primary). LLM abstraction layer also supports OpenAI GPT-4o
- **Data:** Local file storage (hires/ directory), CSV course catalog (53 courses)

---

## 🏗️ Architecture

### Claude Skills Pattern (8 Skills)

The core innovation is the "Claude Skills" architecture - specialized, composable AI skills that work together:

1. **jd-analyzer** - Extract competencies from JD with semantic matching + dynamic bucketing
2. **interview-assessor** - Parse unstructured interview notes → standardized assessment
3. **rating-processor** - Convert manual 1-5 ratings → standardized assessment
4. **gap-identifier** - Compare role requirements vs candidate assessment → skill gaps
5. **content-mapper** - Match gaps to Coursera courses using descriptions + recommend modules
6. **plan-generator** - Create 30/60/90 day onboarding plan
7. **toolkit-generator** - Generate manager support materials (focus areas, check-in prompts, tips)
8. **progress-generator** - Initialize progress tracking framework

**Orchestration:** server/orchestrator/pipeline.js runs all 8 skills. Steps 1-4 are sequential. Steps 5-7 (plan, toolkit, progress) run in parallel via Promise.all. Content mapping (step 4) also parallelizes all gap-to-course matching for speed.

### LLM Abstraction Layer

**Location:** server/llm/

**Design:** Factory pattern for provider-agnostic AI
- base-provider.js - Abstract base class (extracted to avoid circular imports)
- provider.js - Factory function getLLMProvider(config)
- openai-provider.js - GPT-4o implementation
- gemini-provider.js - Gemini 2.5 Pro implementation

**Current .env configuration:**
```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=<user's key>
GEMINI_MODEL=gemini-2.5-pro
OPENAI_API_KEY=sk-your-openai-api-key-here  # not in use
OPENAI_MODEL=gpt-4o
PORT=3000
NODE_ENV=development
```

**Known SDK Issue (fixed):** @google/generative-ai v0.1.3 does not support `responseMimeType` in generationConfig. This field was removed from gemini-provider.js. JSON parsing is handled manually by cleaning markdown code blocks from the response.

**Repository:**
- GitHub: https://github.com/rsengupta94/claude-skills-demo-onboarding-product.git
- Username: rsengupta94
- Branch: main
- Local: /Users/rsengupta/onboarding-platform-project

---

## ✅ CURRENT STATUS — DEMO READY (100% Complete)

### Backend: 100% ✅
- All 8 Claude Skills implemented and tested
- API endpoints complete (7 total)
- Orchestration pipeline working end-to-end
- File management utilities working
- Course CSV adapter working (53 courses loaded)
- Content mapper parallelized for speed

### Frontend: 100% ✅
- All 5 view components wired to live API (completed Task #15)
- Sidebar loads real employees from API, auto-refreshes on route change
- Dashboard shows real calculated metrics
- OnboardingPlan: all 3 tabs (Gap Analysis, Learning Path, 30/60/90) working
- ManagerToolkit: all 3 sections working
- ProgressTracking: all 3 sections working (read-only by design)
- Loading states (PageSkeleton) and error states (ErrorMessage) on all pages

### Data: 100% ✅
- Course catalog: data/courses/course-catalog.csv (53 courses, 9 relevant behavioral skill courses)
- .env configured with Gemini 2.5 Pro
- .gitignore properly configured (protects .env, node_modules, hires/)

---

## 🐛 BUGS FIXED THIS SESSION (2026-03-29)

1. **Circular import crash** — `provider.js` imported from `openai-provider.js` which imported back from `provider.js`. Fixed by extracting `LLMProvider` base class into `server/llm/base-provider.js`.

2. **Gemini `responseMimeType` error** — SDK v0.1.3 doesn't support this field in the `v1` API endpoint. Removed from `gemini-provider.js`. JSON cleanup already handled manually.

3. **Content mapper too slow** — Was making sequential LLM calls: for each gap → for each course → 1 LLM call. With 6 gaps × 9 courses = 54 sequential calls. Fixed by parallelizing both the outer gap loop and inner course loop with `Promise.all`.

4. **All 5 view components using mock data** — Sidebar, Dashboard, OnboardingPlan, ManagerToolkit, ProgressTracking were all reading from static mock data files. All replaced with real API calls with loading/error states.

5. **ManagerToolkit crash** — LLM returns `focusAreas` as `[{id, text}]` objects, `prompts` as `[{id, question}]` objects, and `supportTips` as `[{id, text}]` objects — not plain strings as the TypeScript types suggested. Fixed with defensive rendering: `area.text ?? area.area`, `prompt.question ?? prompt`, `tip.text ?? tip`.

6. **30/60/90 goals crash** — LLM returns `goals` as `[{id, text}]` objects not strings. Fixed with `goal.text ?? goal`.

7. **Progress phase status** — `progress-generator.js` was setting all phases to `'upcoming'`, so the blue "in progress" dot never rendered. Fixed by setting the first phase (Day 30) to `'in_progress'` on initialization.

---

## 📂 CRITICAL FILES

### Backend
- server/server.js — Express app entry point
- server/orchestrator/pipeline.js — Main 8-step orchestration
- claude/skills/*.js — All 8 skills
- server/routes/analyze.js — POST /api/analyze-jd
- server/routes/plans.js — POST /api/plans
- server/routes/employees.js — GET /api/employees + 3 sub-routes
- server/routes/dashboard.js — GET /api/dashboard/metrics
- server/llm/base-provider.js — Abstract base class
- server/llm/provider.js — Factory + re-exports
- server/llm/gemini-provider.js — Gemini implementation
- server/utils/fileManager.js — save/load/list hires

### Frontend
- app/src/app/services/api.ts — API client + all TypeScript types
- app/src/app/components/CreatePlanForm.tsx — JD input + assessment form
- app/src/app/components/GeneratingPlan.tsx — 8-step animation (simulated)
- app/src/app/components/Sidebar.tsx — Employee list from API
- app/src/app/components/Dashboard.tsx — Metrics from API
- app/src/app/components/OnboardingPlan.tsx — 3 tabs, real API data
- app/src/app/components/ManagerToolkit.tsx — 3 sections, real API data
- app/src/app/components/ProgressTracking.tsx — 3 sections, real API data
- app/src/app/components/LoadingSkeleton.tsx — PageSkeleton, MetricCardSkeleton
- app/src/app/components/ErrorMessage.tsx — Reusable error display

### Data
- data/skill-taxonomy.json — 12 initial skill groups + dynamic buckets
- data/courses/course-catalog.csv — 53 courses (behavioral + soft skills focus)
- data/courses/COURSE_DATA_GUIDE.md — Guide for adding more courses
- hires/{employee-id}/*.json — Generated plans (gitignored)

---

## ⚠️ KNOWN DATA SHAPE QUIRKS (Do Not Change Prompts Without Updating Frontend)

The LLM prompts in the skill files define specific JSON output shapes. The frontend has defensive rendering to handle these. If you change prompt output formats, update the frontend rendering too:

| Skill | Field | Actual Shape | Frontend Handles |
|-------|-------|-------------|-----------------|
| toolkit-generator | focusAreas | `[{id, text}]` | `area.text ?? area.area` |
| toolkit-generator | prompts | `[{id, question}]` | `prompt.question ?? prompt` |
| toolkit-generator | supportTips | `[{id, text}]` | `tip.text ?? tip` |
| plan-generator | goals | `[{id, text}]` | `goal.text ?? goal` |

The TypeScript types in api.ts do NOT fully match these shapes — they're simplified. This is intentional for now (demo only). Do not rely on strict TypeScript typing for these fields.

---

## 🎬 DEMO JDs

**Fictional JD created for testing (maps to all 9 catalog courses):**

> **Senior Program Manager, Strategic Initiatives**
> Lead high-impact cross-functional programs. Responsibilities: manage 3–5 concurrent strategic programs, facilitate alignment across Product/Sales/Marketing/Legal, develop executive briefings, apply data-driven decision-making, coach and influence without authority, build stakeholder relationships globally. Requirements: strategic thinking, executive communication (written + verbal), stakeholder management, project management fundamentals (WBS, estimation), problem-solving under ambiguity, cross-functional facilitation, empathetic leadership.

**Interview notes that work well with the above JD:**
> Candidate showed strong analytical thinking and stakeholder awareness but struggled with executive-level communication — tended to over-explain rather than lead with the point. No formal project management experience. Strategic thinking was present but reactive, not proactive. Good listener, collaborative by nature.

**Original 3 demo JDs (user has these):**
1. Sr. Enterprise Digital Strategy Manager (Marketing)
2. Senior Principal Learning Design Consultant (Learning Design)
3. Product Counsel (Legal)

**Common skills across all 3:** Communication, Strategic Thinking, Stakeholder Management
**Demo highlight:** Same behavioral courses recommended across different roles

---

## ✅ WHAT'S FUNCTIONAL vs ❌ WHAT'S NOT

### Fully Working
- JD input via Paste Text
- JD Analysis (dynamic competency extraction, new skill bucket detection)
- Interview Notes assessment
- Competency Ratings assessment (1–5 scale, auto-populated from JD)
- Full plan generation (all 8 skills, end-to-end)
- Gap Analysis tab — severity, progress bars, evidence text
- Learning Path tab — real courses from catalog, links
- 30/60/90 Plan tab — all 3 phases, goals, milestones
- Manager Toolkit — focus areas, conversation prompts by day, support tips
- Progress Tracking — readiness bar, phase indicators, learning checklist, skill progression
- Dashboard metrics — all 5 metrics calculated from real data
- Sidebar — real employee list, auto-refresh on route change
- Data persistence across server restarts

### Not Working / Disabled by Design
- File upload for JD (UI exists, shows "coming soon", no backend handler)
- URL input for JD (UI exists, input is disabled)
- Progress tracking interactivity (read-only, cannot check off items)
- Editing any generated plan (all views read-only)
- Real-time generation progress (animation is simulated timer, not SSE/polling)

---

## 🚀 HOW TO RUN

**Terminal 1 — Backend:**
```bash
cd /Users/rsengupta/onboarding-platform-project
npm install
npm run dev
# Should print: Server running on port 3000, LLM Provider: gemini
```

**Terminal 2 — Frontend:**
```bash
cd /Users/rsengupta/onboarding-platform-project/app
npm install
npm run dev
# Should print: Local: http://localhost:5173
```

Open browser at **http://localhost:5173**

**Health check:** http://localhost:3000/health

---

## 🧪 QUICK TEST COMMANDS

```bash
# Health check
curl http://localhost:3000/health

# List employees
curl http://localhost:3000/api/employees

# Analyze JD
curl -X POST http://localhost:3000/api/analyze-jd \
  -H "Content-Type: application/json" \
  -d '{"jobDescription": "paste JD text here"}'

# Generate plan
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -d '{"hireName": "Test User", "jobDescription": "...", "assessment": {"interviewNotes": "..."}}'
```

---

## 🔮 FEATURES LEFT TO IMPLEMENT (Post-Demo / Future Sessions)

### High Priority
1. **JD File Upload** — UI exists (disabled). Need a backend route `POST /api/upload-jd` using `multer` to handle PDF/DOCX/TXT. Extract text using `pdf-parse` (for PDF) and `mammoth` (for DOCX) — both packages are already installed in package.json. Wire upload to existing JD analysis flow.

2. **Real-time generation progress** — Currently the 8-step animation is a simulated timer. The backend pipeline already has a `progressCallback` hook in place. Need to implement SSE (Server-Sent Events) on `POST /api/plans` and replace the frontend timer with a real event listener. The TODO comment is at `server/routes/plans.js` line 68.

3. **Progress tracking interactivity** — Allow managers/employees to check off learning checklist items and update phase status. Needs a new API endpoint `PATCH /api/employees/:id/progress-tracking` and state management in the frontend ProgressTracking component.

### Medium Priority
4. **TypeScript type cleanup** — The types in `api.ts` don't fully match the actual LLM output shapes (see quirks table above). Should be updated to reflect the real `{id, text}` / `{id, question}` shapes and remove all `any` type workarounds in the components.

5. **URL input for JD** — UI exists (disabled). Would need a backend handler to fetch and parse HTML from a URL, extract job description text, then pass to the existing analysis pipeline.

6. **Error boundaries** — No React error boundaries wrapping the routes. A crash in one component kills the whole app. Add `<ErrorBoundary>` wrappers in routes.ts.

7. **Dashboard metrics refinement** — "Gaps Closed" currently counts low-severity gaps (not user-confirmed). "Avg Time to Complete" is days since creation (not actual completion). These should be tied to real progress tracking updates once interactivity is implemented.

### Low Priority / Production Readiness
8. **Authentication** — No user auth. Any user can see all plans.
9. **Database** — Replace JSON file storage with a proper database (Postgres or SQLite).
10. **Delete/archive plans** — No way to remove a plan from the sidebar once created.
11. **Edit hire name or JD** — Plans are immutable after generation. No regeneration flow.
12. **Export deliverables** — No way to export gap analysis, plan, or toolkit to PDF/Word.
13. **Multi-tenant** — Currently single workspace. No org/team separation.

---

## 🔑 KEY DECISIONS MADE

1. **LLM Provider:** Gemini 2.5 Pro (upgraded from Flash for quality). OpenAI support still in codebase.
2. **Course Content:** Use descriptions NOT transcripts (simpler, more scalable)
3. **Progress Animation:** Simulated timer — actual plan generation is synchronous backend call
4. **Storage:** Local JSON files in hires/ directory (gitignored)
5. **Dynamic Bucketing:** JD analyzer creates new skill groups on the fly — key demo differentiator
6. **Parallel execution:** Content mapper and deliverable generation both parallelized for speed
7. **Defensive rendering:** Frontend uses `?? fallbacks` for LLM output shape uncertainty

---

## 🔄 HOW TO RESUME IN A NEW SESSION

1. Read this CLAUDE.md fully
2. Run `git status` to check for uncommitted changes
3. Run `git log --oneline -5` to see recent commits
4. Start both terminals (backend + frontend) as described above
5. Check http://localhost:3000/health to confirm Gemini is configured
6. Pick up from the Features Left to Implement section above

---

**Last Updated:** 2026-03-29
**Status:** Demo-ready. All core features working end-to-end. Known gaps documented above.
**Git:** All changes committed and pushed to main.
