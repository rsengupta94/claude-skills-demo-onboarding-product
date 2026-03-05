/**
 * Plan Generator Skill
 * Creates 30/60/90 day onboarding plan from gaps and learning path
 */

import { getLLMProvider } from '../../server/llm/provider.js';

/**
 * Generate 30/60/90 day onboarding plan
 * @param {object} gapAnalysis - From gap-identifier
 * @param {object} learningPath - From content-mapper
 * @param {object} options - Optional configuration
 * @returns {Promise<object>} 30/60/90 day plan
 */
export async function generatePlan(gapAnalysis, learningPath, options = {}) {
  console.log('📅 Generating 30/60/90 day plan...');

  // Get LLM provider
  const llm = getLLMProvider(options.llmConfig);

  // Build prompt
  const prompt = buildPlanPrompt(gapAnalysis, learningPath);

  // Define schema
  const schema = {
    type: 'object',
    required: ['phases'],
    properties: {
      phases: { type: 'array' }
    }
  };

  // Call LLM
  console.log(`📡 Calling ${llm.getProviderName()} for plan generation...`);
  const result = await llm.generateStructured(prompt, schema);

  console.log(`✅ Plan generation complete: ${result.phases.length} phases created`);

  return {
    phases: result.phases
  };
}

/**
 * Build the plan generation prompt
 */
function buildPlanPrompt(gapAnalysis, learningPath) {
  const gapsTable = gapAnalysis.gaps
    .map(g => `- ${g.competency}: ${g.severity} severity (current: ${g.currentLevel}, target: ${g.targetLevel})`)
    .join('\n');

  const learningTable = learningPath.learningPath
    .map(l => `- ${l.courseTitle} (addresses ${l.addresses}) - ${l.duration}`)
    .join('\n');

  return `You are an expert L&D plan designer. Create a 30/60/90 day onboarding plan that addresses skill gaps through structured learning and practice.

**Skill Gaps:**
${gapsTable}

**Learning Path:**
${learningTable}

**Planning Framework:**

**Days 1-30: FOUNDATION**
- Focus: Core learning, understanding fundamentals
- Activities: Complete essential courses, understand concepts
- Practice: Low-stakes opportunities to try new skills
- Milestone: Demonstrate basic understanding

**Days 31-60: APPLICATION**
- Focus: Apply skills in real work, get feedback
- Activities: Use skills in actual projects, shadow experts
- Practice: Medium-stakes work with support
- Milestone: Deliver work product using new skills

**Days 61-90: MASTERY**
- Focus: Independent application, teach others
- Activities: Lead initiatives, mentor others on learnings
- Practice: High-stakes work with autonomy
- Milestone: Demonstrate proficiency, share knowledge

**Output Format (JSON):**
{
  "phases": [
    {
      "id": "phase-1",
      "dayRange": "Day 1-30",
      "title": "Foundation",
      "goals": [
        { "id": "1", "text": "Complete Communication and Strategic Thinking courses" },
        { "id": "2", "text": "Understand team communication patterns and strategic planning process" },
        { "id": "3", "text": "Practice new skills in low-stakes team meetings" }
      ],
      "learningActivities": [
        "Executive Communication Mastery - Modules 1-2",
        "Strategic Leadership - Module 1"
      ],
      "practiceActivities": [
        "Shadow senior leader in stakeholder meeting",
        "Present learnings to direct team",
        "Practice executive summary writing"
      ],
      "milestone": "Present course learnings and initial application plan to manager"
    },
    {
      "id": "phase-2",
      "dayRange": "Day 31-60",
      "title": "Application",
      "goals": [
        { "id": "1", "text": "Apply communication skills in stakeholder presentations" },
        { "id": "2", "text": "Lead strategic planning for upcoming project" },
        { "id": "3", "text": "Get feedback and iterate on approach" }
      ],
      "learningActivities": [
        "Review course materials and deepen understanding",
        "Seek mentorship from experienced colleagues"
      ],
      "practiceActivities": [
        "Lead one cross-functional meeting",
        "Present project update to executives",
        "Create strategic roadmap with guidance"
      ],
      "milestone": "Successfully lead cross-functional meeting and deliver executive presentation with positive feedback"
    },
    {
      "id": "phase-3",
      "dayRange": "Day 61-90",
      "title": "Mastery",
      "goals": [
        { "id": "1", "text": "Demonstrate consistent proficiency in communication and strategic thinking" },
        { "id": "2", "text": "Mentor others on effective executive communication" },
        { "id": "3", "text": "Drive strategic initiative independently" }
      ],
      "learningActivities": [
        "Advanced topics: refine and optimize skills",
        "Share knowledge through team workshop"
      ],
      "practiceActivities": [
        "Lead strategic initiative from conception to execution",
        "Present strategic recommendation to leadership",
        "Mentor junior team member on communication skills"
      ],
      "milestone": "Present strategic recommendation to leadership with full stakeholder buy-in and begin mentoring others"
    }
  ]
}

**Important:**
- Distribute learning activities across phases (heaviest in phase 1)
- Progress from learning → applying → teaching
- Make goals specific and measurable
- Milestones should be concrete deliverables
- Ensure activities directly address the identified gaps
- Practice activities should increase in complexity/stakes`;
}

export default {
  generatePlan
};
