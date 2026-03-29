/**
 * Gap Identifier Skill
 * Compares role requirements vs candidate assessment to identify skill gaps
 */

import { getLLMProvider } from '../../server/llm/provider.js';

/**
 * Identify skill gaps
 * @param {object} roleRequirements - From jd-analyzer (requiredCompetencies)
 * @param {object} candidateAssessment - From interview-assessor or rating-processor
 * @param {object} options - Optional configuration
 * @returns {Promise<object>} Gap analysis with severity levels
 */
export async function identifyGaps(roleRequirements, candidateAssessment, options = {}) {
  console.log('🎯 Identifying skill gaps...');

  // Get LLM provider
  const llm = getLLMProvider(options.llmConfig);

  // Build prompt
  const prompt = buildGapAnalysisPrompt(roleRequirements, candidateAssessment);

  // Define schema
  const schema = {
    type: 'object',
    required: ['gaps'],
    properties: {
      gaps: { type: 'array' }
    }
  };

  // Call LLM
  console.log(`📡 Calling ${llm.getProviderName()} for gap analysis...`);
  const result = await llm.generateStructured(prompt, schema);

  // Sort gaps by priority
  result.gaps.sort((a, b) => (a.priority || 0) - (b.priority || 0));

  console.log(`✅ Gap analysis complete: ${result.gaps.length} gaps identified`);

  return {
    gaps: result.gaps
  };
}

/**
 * Build the gap analysis prompt
 */
function buildGapAnalysisPrompt(roleRequirements, candidateAssessment) {
  const requirementsTable = roleRequirements.requiredCompetencies
    .map(c => `- ${c.competency}: ${c.importance} importance (${c.evidence})`)
    .join('\n');

  const assessmentTable = candidateAssessment.competencyScores
    .map(c => `- ${c.competency}: Score ${c.score}/4 (${c.evidence})`)
    .join('\n');

  return `You are an expert L&D analyst. Compare the role requirements with the candidate's current capabilities to identify skill gaps.

**Role Requirements:**
${requirementsTable}

**Candidate Assessment:**
${assessmentTable}

**Gap Analysis Framework:**

1. **For each required competency**, compare requirement vs. actual level:
   - Target Level: Based on importance (high = 4, moderate = 3, low = 2-3)
   - Current Level: From assessment score (1-4)
   - Gap Size: Target - Current

2. **Calculate Severity:**
   - **High**: Gap of 2+ levels (target - current >= 2)
   - **Moderate**: Gap of exactly 1 level (target - current = 1)
   - **Low**: Gap < 1 level

3. **Prioritize Gaps:**
   - Priority 1: High severity, high importance
   - Priority 2: High severity OR high importance
   - Priority 3: Moderate severity
   - Priority 4: Low severity

4. **Generate Evidence:**
   - Clear statement of the gap
   - Quote from both JD and assessment
   - Why this matters for the role

**Output Format (JSON):**
{
  "gaps": [
    {
      "competency": "Strategic Thinking",
      "severity": "moderate",
      "currentLevel": 2,
      "targetLevel": 4,
      "gapSize": 2,
      "priority": 1,
      "evidence": "Role requires strong strategic planning and vision-setting (high importance), but candidate currently at developing level with limited experience connecting tactics to long-term strategy.",
      "impact": "Critical for translating product vision into actionable roadmaps and making data-driven prioritization decisions."
    },
    {
      "competency": "Communication",
      "severity": "low",
      "currentLevel": 3,
      "targetLevel": 4,
      "gapSize": 1,
      "priority": 3,
      "evidence": "Role needs strong communication with executives, candidate has solid skills but limited executive-level presentation experience.",
      "impact": "Important for stakeholder alignment and securing buy-in for initiatives."
    }
  ]
}

**Important:**
- Only include competencies where there IS a gap (target > current)
- Be realistic about target levels based on importance
- High importance + any gap should be at least "moderate" severity
- Include clear, actionable evidence statements
- Lower priority number = higher priority (1 is highest)`;
}

/**
 * Calculate target level from importance
 */
function getTargetLevel(importance) {
  switch (importance.toLowerCase()) {
    case 'high':
      return 4;
    case 'moderate':
      return 3;
    case 'low':
      return 2;
    default:
      return 3;
  }
}

/**
 * Calculate severity from gap size and importance
 */
function calculateSeverity(gapSize) {
  if (gapSize >= 2) return 'high';
  if (gapSize >= 1) return 'moderate';
  return 'low';
}

/**
 * Quick gap calculation (without LLM, for testing)
 */
export function calculateGapsSimple(roleRequirements, candidateAssessment) {
  const gaps = [];

  for (const required of roleRequirements.requiredCompetencies) {
    const assessment = candidateAssessment.competencyScores.find(
      c => c.competency === required.competency
    );

    if (!assessment) {
      // No assessment data, assume needs development
      const targetLevel = getTargetLevel(required.importance);
      gaps.push({
        competency: required.competency,
        severity: required.importance === 'high' ? 'high' : 'moderate',
        currentLevel: 1,
        targetLevel,
        gapSize: targetLevel - 1,
        priority: required.importance === 'high' ? 1 : 2,
        evidence: `${required.competency} required (${required.importance} importance) but no assessment data available.`,
        impact: required.evidence
      });
      continue;
    }

    const targetLevel = getTargetLevel(required.importance);
    const currentLevel = assessment.score;
    const gapSize = targetLevel - currentLevel;

    if (gapSize > 0) {
      const severity = calculateSeverity(gapSize);
      const priority = severity === 'high' ? 1 : severity === 'moderate' ? 2 : 3;

      gaps.push({
        competency: required.competency,
        severity,
        currentLevel,
        targetLevel,
        gapSize,
        priority,
        evidence: `Role requires ${required.competency} (${required.importance} importance). ${assessment.evidence}`,
        impact: required.evidence
      });
    }
  }

  return { gaps: gaps.sort((a, b) => a.priority - b.priority) };
}

export default {
  identifyGaps,
  calculateGapsSimple
};
