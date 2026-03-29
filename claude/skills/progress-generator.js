/**
 * Progress Generator Skill
 * Creates progress tracking framework from learning path and plan
 */

import { getLLMProvider } from '../../server/llm/provider.js';

/**
 * Generate progress tracking framework
 * @param {object} learningPath - From content-mapper
 * @param {object} plan306090 - From plan-generator
 * @param {object} gapAnalysis - From gap-identifier
 * @param {object} options - Optional configuration
 * @returns {Promise<object>} Progress tracking framework
 */
export async function generateProgressFramework(learningPath, plan306090, gapAnalysis, options = {}) {
  console.log('📊 Generating progress tracking framework...');

  // Get LLM provider
  const llm = getLLMProvider(options.llmConfig);

  // Build prompt
  const prompt = buildProgressPrompt(learningPath, plan306090, gapAnalysis);

  // Define schema
  const schema = {
    type: 'object',
    required: ['overallReadiness', 'phases', 'learningChecklist', 'skillProgression'],
    properties: {
      overallReadiness: { type: 'number' },
      phases: { type: 'array' },
      learningChecklist: { type: 'array' },
      skillProgression: { type: 'array' }
    }
  };

  // Call LLM
  console.log(`📡 Calling ${llm.getProviderName()} for progress framework...`);
  const result = await llm.generateStructured(prompt, schema);

  console.log(`✅ Progress framework generation complete`);

  return {
    overallReadiness: 0, // Always start at 0%
    phases: result.phases.map((p, i) => ({ ...p, status: i === 0 ? 'in_progress' : 'upcoming' })),
    learningChecklist: result.learningChecklist.map(item => ({ ...item, status: 'not-started' })),
    skillProgression: result.skillProgression.map(skill => ({
      ...skill,
      current: skill.before // Current starts same as before
    }))
  };
}

/**
 * Build the progress generation prompt
 */
function buildProgressPrompt(learningPath, plan306090, gapAnalysis) {
  const coursesTable = learningPath.learningPath
    .map(l => `- ${l.courseTitle} (${l.duration})`)
    .join('\n');

  const gapsTable = gapAnalysis.gaps
    .map(g => `- ${g.competency}: Level ${g.currentLevel} → ${g.targetLevel}`)
    .join('\n');

  return `You are an expert L&D progress tracker. Create a framework for tracking the new hire's onboarding progress.

**Learning Path:**
${coursesTable}

**Skill Gaps to Track:**
${gapsTable}

**Your Task:**

Create three tracking components:

**1. Phase Indicators (Days 30, 60, 90)**
- Simple status tracking for each phase
- Initial status: all "upcoming"
- Will be updated as phases complete

**2. Learning Checklist**
- Break down each course into modules/components
- Track completion status
- Initial status: all "not-started"

**3. Skill Progression**
- Track each gap competency
- Before: Current level from gap analysis
- Current: Starts same as before (will be updated)
- Target: Target level from gap analysis

**Output Format (JSON):**
{
  "overallReadiness": 0,
  "phases": [
    { "day": 30, "status": "upcoming" },
    { "day": 60, "status": "upcoming" },
    { "day": 90, "status": "upcoming" }
  ],
  "learningChecklist": [
    {
      "id": "1",
      "title": "Executive Communication Mastery",
      "module": "Module 1: Presenting to Executives",
      "status": "not-started",
      "courseId": "comm-exec-mastery"
    },
    {
      "id": "2",
      "title": "Executive Communication Mastery",
      "module": "Module 2: Stakeholder Messaging",
      "status": "not-started",
      "courseId": "comm-exec-mastery"
    },
    {
      "id": "3",
      "title": "Strategic Leadership",
      "module": "Module 1: Vision and Planning",
      "status": "not-started",
      "courseId": "strategic-leadership"
    }
  ],
  "skillProgression": [
    {
      "id": "1",
      "competency": "Communication",
      "before": 2,
      "current": 2,
      "target": 4
    },
    {
      "id": "2",
      "competency": "Strategic Thinking",
      "before": 2,
      "current": 2,
      "target": 4
    }
  ]
}

**Important:**
- Create realistic module breakdowns (1-3 modules per course)
- Module names should describe what's learned
- All progress starts at initial state (0% ready, not-started, current=before)
- Include all gap competencies in skill progression
- Use clear, descriptive module titles`;
}

/**
 * Simple progress framework generation (without LLM)
 */
export function generateProgressFrameworkSimple(learningPath, plan306090, gapAnalysis) {
  const learningChecklist = [];
  let checklistId = 1;

  // Create checklist from learning path
  for (const course of learningPath.learningPath) {
    // Assume 1-2 modules per course for demo
    const moduleCount = course.duration.includes('4') ? 2 : 1;

    for (let i = 1; i <= moduleCount; i++) {
      learningChecklist.push({
        id: String(checklistId++),
        title: course.courseTitle,
        module: `Module ${i}`,
        status: 'not-started',
        courseId: course.courseId
      });
    }
  }

  // Create skill progression from gaps
  const skillProgression = gapAnalysis.gaps.map((gap, index) => ({
    id: String(index + 1),
    competency: gap.competency,
    before: gap.currentLevel,
    current: gap.currentLevel,
    target: gap.targetLevel
  }));

  return {
    overallReadiness: 0,
    phases: [
      { day: 30, status: 'in_progress' },
      { day: 60, status: 'upcoming' },
      { day: 90, status: 'upcoming' }
    ],
    learningChecklist,
    skillProgression
  };
}

export default {
  generateProgressFramework,
  generateProgressFrameworkSimple
};
