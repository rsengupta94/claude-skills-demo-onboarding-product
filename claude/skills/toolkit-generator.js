/**
 * Toolkit Generator Skill
 * Creates manager toolkit with focus areas, conversation prompts, and support tips
 */

import { getLLMProvider } from '../../server/llm/provider.js';

/**
 * Generate manager toolkit
 * @param {object} gapAnalysis - From gap-identifier
 * @param {object} candidateAssessment - From interview-assessor or rating-processor
 * @param {object} options - Optional configuration
 * @returns {Promise<object>} Manager toolkit
 */
export async function generateToolkit(gapAnalysis, candidateAssessment, options = {}) {
  console.log('🧰 Generating manager toolkit...');

  // Get LLM provider
  const llm = getLLMProvider(options.llmConfig);

  // Build prompt
  const prompt = buildToolkitPrompt(gapAnalysis, candidateAssessment);

  // Define schema
  const schema = {
    type: 'object',
    required: ['developmentSummary', 'conversationPrompts', 'supportTips'],
    properties: {
      developmentSummary: { type: 'object' },
      conversationPrompts: { type: 'array' },
      supportTips: { type: 'array' }
    }
  };

  // Call LLM
  console.log(`📡 Calling ${llm.getProviderName()} for toolkit generation...`);
  const result = await llm.generateStructured(prompt, schema);

  console.log(`✅ Toolkit generation complete`);

  return {
    developmentSummary: result.developmentSummary,
    conversationPrompts: result.conversationPrompts,
    supportTips: result.supportTips
  };
}

/**
 * Build the toolkit generation prompt
 */
function buildToolkitPrompt(gapAnalysis, candidateAssessment) {
  const topGaps = gapAnalysis.gaps
    .slice(0, 5)
    .map(g => `- ${g.competency} (${g.severity}): ${g.evidence}`)
    .join('\n');

  const strengths = candidateAssessment.competencyScores
    .filter(c => c.score >= 3)
    .map(c => `- ${c.competency}: ${c.strengths ? c.strengths.join(', ') : 'Strong capability'}`)
    .join('\n');

  return `You are an expert people manager and L&D consultant. Create a toolkit to help the hiring manager support this new hire's development.

**Top Development Needs:**
${topGaps}

**Candidate Strengths:**
${strengths}

**Toolkit Components:**

**1. Development Summary**
- Focus Areas: Top 2-3 development priorities
- Keep it concise and actionable

**2. Conversation Prompts**
- Day 30: Check-in questions for first month
- Day 60: Questions for mid-onboarding check-in
- Day 90: Questions for onboarding completion
- Questions should be open-ended and coaching-oriented

**3. Support Tips**
- Specific actions manager can take to support development
- Include: shadowing opportunities, practice scenarios, resources
- 3-5 concrete, actionable tips

**Output Format (JSON):**
{
  "developmentSummary": {
    "focusAreas": [
      { "id": "1", "text": "Executive communication and stakeholder presentations" },
      { "id": "2", "text": "Strategic planning and vision-setting" }
    ]
  },
  "conversationPrompts": [
    {
      "day": 30,
      "prompts": [
        { "id": "1", "question": "How comfortable do you feel presenting to senior stakeholders? What's been challenging?" },
        { "id": "2", "question": "Tell me about a recent situation where you had to communicate complex ideas. What approach did you take?" },
        { "id": "3", "question": "What support would help you build confidence in executive communication?" }
      ]
    },
    {
      "day": 60,
      "prompts": [
        { "id": "1", "question": "Share an example of how you've applied your communication learnings. What worked well?" },
        { "id": "2", "question": "How are you approaching strategic thinking in your current projects?" },
        { "id": "3", "question": "What challenges are you facing in translating strategy into action?" }
      ]
    },
    {
      "day": 90,
      "prompts": [
        { "id": "1", "question": "How has your approach to executive communication evolved over the past 90 days?" },
        { "id": "2", "question": "What strategic initiative are you most proud of? Walk me through your thinking." },
        { "id": "3", "question": "How might you mentor others on what you've learned?" }
      ]
    }
  ],
  "supportTips": [
    { "id": "1", "text": "Pair with senior leader for shadowing in executive meetings - observe how they adapt messaging and handle questions" },
    { "id": "2", "text": "Provide low-stakes presentation opportunities like team updates before higher-stakes executive presentations" },
    { "id": "3", "text": "Share examples of strong executive communications (slide decks, memos) as models" },
    { "id": "4", "text": "Schedule brief pre-meeting prep sessions before important stakeholder interactions" },
    { "id": "5", "text": "Create safe space for practicing strategic thinking - regular 1:1s to discuss long-term vision" }
  ]
}

**Important:**
- Make prompts coaching-oriented, not evaluative
- Support tips should be specific and immediately actionable
- Focus on creating opportunities to practice, not just observe
- Balance challenge with support
- Day 30 prompts: Understanding and early challenges
- Day 60 prompts: Application and feedback
- Day 90 prompts: Mastery and knowledge sharing`;
}

export default {
  generateToolkit
};
