/**
 * Interview Assessor Skill
 * Parses unstructured interview notes and extracts competency assessments
 */

import { getLLMProvider } from '../../server/llm/provider.js';
import { loadTaxonomy } from '../../server/utils/taxonomyManager.js';

/**
 * Assess candidate from interview notes
 * @param {string} interviewNotes - Free-form interview notes
 * @param {Array} requiredCompetencies - Competencies from JD analysis (optional)
 * @param {object} options - Optional configuration
 * @returns {Promise<object>} Standardized assessment
 */
export async function assessFromInterview(interviewNotes, requiredCompetencies = [], options = {}) {
  console.log('📝 Assessing candidate from interview notes...');

  // Load taxonomy
  const taxonomy = await loadTaxonomy();

  // Get LLM provider
  const llm = getLLMProvider(options.llmConfig);

  // Build prompt
  const prompt = buildInterviewAssessmentPrompt(interviewNotes, requiredCompetencies, taxonomy);

  // Define schema
  const schema = {
    type: 'object',
    required: ['assessmentType', 'competencyScores'],
    properties: {
      assessmentType: { type: 'string' },
      competencyScores: { type: 'array' }
    }
  };

  // Call LLM
  console.log(`📡 Calling ${llm.getProviderName()} for interview assessment...`);
  const result = await llm.generateStructured(prompt, schema);

  console.log(`✅ Interview assessment complete: ${result.competencyScores.length} competencies assessed`);

  return {
    assessmentType: 'interview',
    competencyScores: result.competencyScores
  };
}

/**
 * Build the assessment prompt
 */
function buildInterviewAssessmentPrompt(interviewNotes, requiredCompetencies, taxonomy) {
  const competencyList = requiredCompetencies.length > 0
    ? requiredCompetencies.map(c => c.competency).join(', ')
    : 'all relevant competencies';

  return `You are an expert HR assessor. Analyze these interview notes and extract competency assessments.

**Interview Notes:**
${interviewNotes}

**Focus Competencies:**
${competencyList}

**Assessment Scale:**
- **4 = Exceeds Expectations**: Strong evidence of mastery, multiple examples
- **3 = Meets Expectations**: Solid capability, some good examples
- **2 = Developing**: Basic capability, needs improvement
- **1 = Needs Development**: Minimal evidence, significant gaps

**Your Task:**

1. **Extract evidence** for each competency from the interview notes
2. **Assign a score** (1-4) based on the evidence
3. **Identify strengths**: Specific things the candidate does well
4. **Identify gaps**: Areas needing development

**Output Format (JSON):**
{
  "assessmentType": "interview",
  "competencyScores": [
    {
      "competency": "Communication",
      "score": 3,
      "evidence": "Candidate clearly articulated their product vision. Used concrete examples when explaining technical concepts to non-technical stakeholders.",
      "strengths": [
        "Clear articulation",
        "Good use of examples",
        "Adapts message to audience"
      ],
      "gaps": [
        "Could be more concise in explanations",
        "Limited experience with executive presentations"
      ]
    },
    {
      "competency": "Strategic Thinking",
      "score": 2,
      "evidence": "Showed some strategic awareness but struggled to connect tactical decisions to long-term vision.",
      "strengths": [
        "Understands market trends"
      ],
      "gaps": [
        "Difficulty translating strategy into action",
        "Lacks long-term planning experience"
      ]
    }
  ]
}

**Important:**
- Only assess competencies where you have evidence from the notes
- Be objective - base scores on concrete evidence
- If minimal evidence for a competency, assign score 1-2
- Include both strengths and gaps for balanced assessment`;
}

export default {
  assessFromInterview
};
