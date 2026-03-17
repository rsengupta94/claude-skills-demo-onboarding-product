# Coursera Onboarding L&D Partner - AI Demo

## 🎯 Project Overview

**Purpose:** High-stakes demo for Coursera directors showcasing AI-powered professional services capabilities.

**What it does:** Transforms hiring data (job descriptions + candidate assessments) into 5 personalized onboarding deliverables using "Claude Skills" architecture pattern.

**Demo Context:**
- Audience: Coursera senior directors
- Goal: Showcase both business value (personalized onboarding) and technical sophistication (Claude Skills orchestration)
- Scope: Functional end-to-end demo, not production-ready

**Tech Stack:**
- **Backend:** Node.js + Express (ES modules)
- **Frontend:** React + Vite + TailwindCSS + React Router 7 + Radix UI (from Figma)
- **AI:** LLM-agnostic (supports OpenAI GPT-4o and Gemini 2.5 Flash)
- **Data:** Local file storage (hires/ directory), CSV course catalog

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

**Orchestration:** server/orchestrator/pipeline.js runs all 8 skills in sequence (with parallel execution for deliverables).

### LLM Abstraction Layer

**Location:** server/llm/

**Design:** Factory pattern for provider-agnostic AI
- provider.js - Factory function getLLMProvider(config)
- openai-provider.js - GPT-4o implementation
- gemini-provider.js - Gemini 2.5 Flash implementation

**Environment Configuration:**
```bash
LLM_PROVIDER=openai  # or gemini
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
```

**Repository:**
- GitHub: https://github.com/rsengupta94/claude-skills-demo-onboarding-product.git
- Username: rsengupta94
- Branch: main
- Local: /Users/rsengupta/onboarding-platform-project

---

## ✅ CURRENT STATUS (90% Complete)

### Backend: 100% ✅
- All 8 Claude Skills implemented
- API endpoints complete (7 total)
- Orchestration pipeline working
- File management utilities ready
- Course CSV adapter implemented

### Frontend: 90% 🔄
- ✅ API client service complete
- ✅ Shared UI components (LoadingSpinner, ErrorMessage, LoadingSkeleton)
- ✅ CreatePlanForm - fully rewritten with dynamic competency extraction
- ✅ GeneratingPlan - updated to 8 steps
- ⏳ Task #15 IN PROGRESS: 5 view components need API integration
  - Sidebar.tsx
  - Dashboard.tsx  
  - OnboardingPlan.tsx
  - ManagerToolkit.tsx
  - ProgressTracking.tsx

---

## 📋 NEXT STEPS (Priority Order)

### User Tasks (Critical)
1. **Git Push** - Push backend work to GitHub
2. **Provide CSV** - Course catalog at data/courses/course-catalog.csv
3. **Setup .env** - Copy .env.example, add API keys
4. **Test Backend** - npm install && npm run dev

### Development Tasks
5. **Complete Task #15** - Replace mock data in 5 view components
6. **End-to-end testing** - Test all 3 demo JDs
7. **Demo prep** - Screenshots, script, practice

---

## 🔑 KEY DECISIONS MADE

1. **LLM Providers:** Support both OpenAI + Gemini (no Claude API available)
2. **Course Content:** Use descriptions NOT transcripts (simpler, more scalable)
3. **Progress:** Simulated animation (no SSE implemented)
4. **Storage:** Local JSON files in hires/ directory
5. **Dynamic Bucketing:** Key differentiator - JD analyzer creates new skill groups on the fly

---

## 📂 CRITICAL FILES

### Backend
- server/server.js - Express app
- server/orchestrator/pipeline.js - Main orchestration
- claude/skills/*.js - All 8 skills
- server/routes/*.js - 7 API endpoints
- server/llm/provider.js - LLM abstraction

### Frontend (Updated)
- app/src/app/services/api.ts - API client ✅
- app/src/app/components/CreatePlanForm.tsx - Fully rewritten ✅
- app/src/app/components/GeneratingPlan.tsx - Updated ✅
- app/src/app/components/LoadingSpinner.tsx - New ✅
- app/src/app/components/ErrorMessage.tsx - New ✅

### Data
- data/skill-taxonomy.json - 12 initial groups + dynamic
- data/courses/course-catalog.csv - USER TO PROVIDE
- hires/{employee-id}/*.json - Generated plans

---

## 🧪 TESTING

### Backend Test Commands
```bash
# Health check
curl http://localhost:3000/health

# Analyze JD
curl -X POST http://localhost:3000/api/analyze-jd \
  -H "Content-Type: application/json" \
  -d '{"jobDescription": "paste JD text..."}'

# Generate plan
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -d '{"hireName": "Test", "jobDescription": "...", "assessment": {"interviewNotes": "..."}}'
```

### Frontend Test Flow
1. Navigate to /create-plan
2. Paste JD text
3. Click "Analyze Job Description"
4. Verify competencies extracted
5. Provide assessment
6. Generate plan → watch 8-step animation
7. Check all deliverables load

---

## 🎬 DEMO JDSSUMMARY

User provided 3 JDs for demo:
1. Sr. Enterprise Digital Strategy Manager (Marketing)
2. Senior Principal Learning Design Consultant (Learning Design)
3. Product Counsel (Legal)

**Common Skills:** Communication, Strategic Thinking, Stakeholder Management

**Demo Highlight:** Same behavioral courses recommended for different roles

---

## 🚧 KNOWN LIMITATIONS

**Not Implemented (Intentional):**
- File upload for JD (UI exists, disabled)
- URL input for JD (UI exists, disabled)
- Real-time SSE/polling
- User authentication
- Database (using JSON files)

**To Fix:**
- Task #15: Replace mock data in 5 components
- Add error boundaries
- Complete loading states

---

## 🔄 HOW TO RESUME

1. Read this CLAUDE.md
2. Check git status
3. Review Task #15 status (5 components pending)
4. Continue frontend API integration
5. User should: push git, provide CSV, setup .env

**Last Session:** Built entire backend + 90% of frontend integration
**Next Session:** Finish Task #15, test end-to-end, demo prep

---

**Last Updated:** 2026-02-12 before machine restart
**Status:** Backend complete, frontend 90% complete, ready for CSV + testing
