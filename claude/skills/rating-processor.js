/**
 * Rating Processor Skill
 * Converts manual competency ratings (1-5 scale) to standardized assessment format
 */

import { getLLMProvider } from '../../server/llm/provider.js';

/**
 * Process manual competency ratings
 * @param {Array} competencyRatings - Array of {competency, rating} objects
 * @param {object} options - Optional configuration
 * @returns {Promise<object>} Standardized assessment
 */
export async function processRatings(competencyRatings, options = {}) {
  console.log('📊 Processing competency ratings...');

  // Get LLM provider
  const llm = getLLMProvider(options.llmConfig);

  // Build prompt
  const prompt = buildRatingProcessPrompt(competencyRatings);

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
  console.log(`📡 Calling ${llm.getProviderName()} for rating interpretation...`);
  const result = await llm.generateStructured(prompt, schema);

  console.log(`✅ Rating processing complete: ${result.competencyScores.length} competencies processed`);

  return {
    assessmentType: 'ratings',
    competencyScores: result.competencyScores
  };
}

/**
 * Build the rating processing prompt
 */
function buildRatingProcessPrompt(competencyRatings) {
  const ratingsTable = competencyRatings
    .map(r => `- ${r.competency}: ${r.rating}/5`)
    .join('\n');

  return `You are an expert HR assessor. Convert these manual competency ratings into a detailed assessment.

**Manual Ratings (1-5 scale):**
${ratingsTable}

**Rating Scale:**
- **5 = Exceeds Expectations**: Exceptional capability
- **4 = Meets Expectations (High)**: Strong capability
- **3 = Meets Expectations**: Solid capability
- **2 = Developing**: Needs some improvement
- **1 = Needs Development**: Significant gaps

**Your Task:**

1. **Convert 1-5 ratings to 1-4 scale** for consistency:
   - 5 → 4 (Exceeds)
   - 4 → 3-4 (Meets/Exceeds)
   - 3 → 3 (Meets)
   - 2 → 2 (Developing)
   - 1 → 1 (Needs Development)

2. **Add interpretive context** for each rating:
   - Evidence: What a rating at this level typically indicates
   - Strengths: What they likely do well at this level
   - Gaps: What they likely need to develop

**Output Format (JSON):**
{
  "assessmentType": "ratings",
  "competencyScores": [
    {
      "competency": "Communication",
      "score": 3,
      "evidence": "Rating of 4/5 indicates strong communication skills with clear articulation and effective presentation abilities.",
      "strengths": [
        "Likely communicates clearly",
        "Probably effective in presentations",
        "Can explain complex concepts"
      ],
      "gaps": [
        "May need experience with executive-level communication",
        "Could benefit from advanced storytelling techniques"
      ]
    },
    {
      "competency": "Strategic Thinking",
      "score": 2,
      "evidence": "Rating of 2/5 suggests developing strategic capabilities that need strengthening.",
      "strengths": [
        "Shows awareness of strategy concepts",
        "Willing to learn strategic planning"
      ],
      "gaps": [
        "Limited experience connecting tactics to strategy",
        "Needs practice with long-term planning",
        "Should develop business acumen"
      ]
    }
  ]
}

**Important:**
- Be realistic about what each rating level means
- Provide actionable insights in strengths and gaps
- Higher ratings should have fewer/smaller gaps
- Lower ratings should have more specific development needs`;
}

/**
 * Merge interview and rating assessments
 * @param {object} interviewAssessment - Assessment from interview notes
 * @param {object} ratingAssessment - Assessment from ratings
 * @returns {object} Merged assessment
 */
export function mergeAssessments(interviewAssessment, ratingAssessment) {
  console.log('🔄 Merging interview and rating assessments...');

  const merged = {
    assessmentType: 'combined',
    competencyScores: []
  };

  // Create a map of competencies
  const competencyMap = new Map();

  // Add interview assessments
  if (interviewAssessment && interviewAssessment.competencyScores) {
    for (const score of interviewAssessment.competencyScores) {
      competencyMap.set(score.competency, { ...score, source: 'interview' });
    }
  }

  // Add/merge rating assessments
  if (ratingAssessment && ratingAssessment.competencyScores) {
    for (const score of ratingAssessment.competencyScores) {
      if (competencyMap.has(score.competency)) {
        // Average the scores if both exist
        const existing = competencyMap.get(score.competency);
        const avgScore = Math.round((existing.score + score.score) / 2);

        competencyMap.set(score.competency, {
          competency: score.competency,
          score: avgScore,
          evidence: `${existing.evidence}\n\nRating: ${score.evidence}`,
          strengths: [...new Set([...existing.strengths, ...score.strengths])],
          gaps: [...new Set([...existing.gaps, ...score.gaps])],
          source: 'combined'
        });
      } else {
        competencyMap.set(score.competency, { ...score, source: 'ratings' });
      }
    }
  }

  merged.competencyScores = Array.from(competencyMap.values());

  console.log(`✅ Merged assessment: ${merged.competencyScores.length} competencies`);

  return merged;
}

export default {
  processRatings,
  mergeAssessments
};
