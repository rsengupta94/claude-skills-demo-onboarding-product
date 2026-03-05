/**
 * JD Analyzer Skill
 * Extracts competencies from job descriptions with semantic matching and dynamic bucketing
 */

import { getLLMProvider } from '../../server/llm/provider.js';
import { loadTaxonomy, addDynamicBuckets } from '../../server/utils/taxonomyManager.js';

/**
 * Analyze job description and extract competencies
 * @param {string} jobDescription - The job description text
 * @param {object} options - Optional configuration
 * @returns {Promise<object>} Analysis results with competencies and new buckets
 */
export async function analyzeJobDescription(jobDescription, options = {}) {
  console.log('🔍 Starting JD analysis...');

  // Load current taxonomy
  const taxonomy = await loadTaxonomy();

  // Get LLM provider
  const llm = getLLMProvider(options.llmConfig);

  // Build the prompt
  const prompt = buildAnalysisPrompt(jobDescription, taxonomy);

  // Define the expected schema
  const schema = {
    type: 'object',
    required: ['roleTitle', 'requiredCompetencies', 'newBuckets'],
    properties: {
      roleTitle: { type: 'string' },
      requiredCompetencies: { type: 'array' },
      newBuckets: { type: 'array' }
    }
  };

  // Call LLM
  console.log(`📡 Calling ${llm.getProviderName()} (${llm.getModel()})...`);
  const result = await llm.generateStructured(prompt, schema);

  // Process new buckets if any
  if (result.newBuckets && result.newBuckets.length > 0) {
    console.log(`✨ ${result.newBuckets.length} new skill bucket(s) identified`);
    await addDynamicBuckets(result.newBuckets);
  }

  console.log(`✅ JD analysis complete: ${result.requiredCompetencies.length} competencies extracted`);

  return {
    roleTitle: result.roleTitle,
    requiredCompetencies: result.requiredCompetencies,
    newBuckets: result.newBuckets || []
  };
}

/**
 * Build the analysis prompt
 */
function buildAnalysisPrompt(jobDescription, taxonomy) {
  const taxonomyDescription = formatTaxonomyForPrompt(taxonomy);

  return `You are an expert HR and L&D analyst. Analyze this job description and extract all required competencies/skills.

**Job Description:**
${jobDescription}

**Existing Skill Taxonomy:**
${taxonomyDescription}

**Your Task:**

1. **Extract the role title** from the job description

2. **Identify all key competencies/skills** mentioned or implied in the JD

3. **For each competency, semantically match it to the existing taxonomy:**
   - Use **semantic matching**, not exact keyword matching
   - Consider synonyms and related concepts
   - Example: "executive communication" matches "Communication" group
   - Example: "working across teams" matches "Collaboration" group

4. **Dynamic Bucketing Rules:**
   - If a skill is mentioned **multiple times** or appears in **key requirements** AND
   - It does NOT fit well into any existing group (semantic mismatch), THEN
   - Propose a NEW skill bucket for it

5. **For each matched competency, determine:**
   - Importance level: "high", "moderate", or "low"
   - Evidence: Quote or reference from the JD

**Output Format (JSON):**
{
  "roleTitle": "Senior Product Manager",
  "requiredCompetencies": [
    {
      "competency": "Communication",
      "groupId": "communication",
      "category": "behavioral",
      "importance": "high",
      "evidence": "Must present product vision to executives and stakeholders",
      "matchType": "existing"
    },
    {
      "competency": "Regulatory & Compliance",
      "groupId": "regulatory-compliance",
      "category": "technical",
      "importance": "moderate",
      "evidence": "Ensure product meets GDPR and healthcare compliance standards",
      "matchType": "new_bucket"
    }
  ],
  "newBuckets": [
    {
      "groupId": "regulatory-compliance",
      "groupName": "Regulatory & Compliance",
      "covers": ["policy interpretation", "regulatory frameworks", "compliance programs", "GDPR", "healthcare regulations"],
      "category": "technical",
      "rationale": "Mentioned 3 times in key requirements, doesn't fit existing technical groups"
    }
  ]
}

**Important:**
- Be generous with semantic matching - only create new buckets for truly distinct skill areas
- Focus on behavioral skills for demo purposes (but identify technical skills if present)
- If no new buckets needed, return empty array: "newBuckets": []
- Limit new buckets to truly significant skills mentioned multiple times`;
}

/**
 * Format taxonomy for the prompt
 */
function formatTaxonomyForPrompt(taxonomy) {
  let description = '';

  for (const category in taxonomy) {
    description += `\n**${category.toUpperCase()}:**\n`;
    for (const group of taxonomy[category]) {
      description += `- ${group.group_name} (${group.group_id}): ${group.covers.join(', ')}\n`;
    }
  }

  return description;
}

/**
 * Quick analysis (for frontend "Analyze JD" button)
 * Returns only competencies without writing to taxonomy
 */
export async function quickAnalyzeJobDescription(jobDescription, options = {}) {
  const result = await analyzeJobDescription(jobDescription, options);

  // Return only competencies and new buckets (don't persist new buckets yet)
  return {
    competencies: result.requiredCompetencies,
    newBuckets: result.newBuckets,
    roleTitle: result.roleTitle
  };
}

export default {
  analyzeJobDescription,
  quickAnalyzeJobDescription
};
