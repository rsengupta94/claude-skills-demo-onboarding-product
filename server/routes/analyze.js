/**
 * Analyze Job Description Endpoint
 * POST /api/analyze-jd - Extract competencies from JD
 */

import express from 'express';
import { analyzeJobDescription } from '../../claude/skills/jd-analyzer.js';

const router = express.Router();

/**
 * POST /api/analyze-jd
 * Analyzes job description and extracts competencies
 * Used by frontend to populate dynamic competency ratings
 */
router.post('/analyze-jd', async (req, res) => {
  console.log('\n📋 POST /api/analyze-jd - Analyzing job description');

  try {
    const { jobDescription, llmConfig } = req.body;

    // Validation
    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Job description is required and must be a non-empty string'
      });
    }

    // Run JD analyzer
    console.log(`📄 JD length: ${jobDescription.length} characters`);

    const analysis = await analyzeJobDescription(jobDescription, llmConfig);

    console.log(`✅ Extracted ${analysis.requiredCompetencies.length} competencies`);
    if (analysis.newBuckets && analysis.newBuckets.length > 0) {
      console.log(`✨ Created ${analysis.newBuckets.length} new skill bucket(s)`);
    }

    // Return analysis
    res.json({
      success: true,
      data: {
        roleTitle: analysis.roleTitle,
        competencies: analysis.requiredCompetencies,
        newBuckets: analysis.newBuckets || []
      }
    });

  } catch (error) {
    console.error('❌ Error analyzing job description:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze job description'
    });
  }
});

export default router;
