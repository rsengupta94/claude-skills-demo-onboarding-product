/**
 * Plans Endpoint
 * POST /api/plans - Generate complete onboarding plan
 */

import express from 'express';
import { generateOnboardingPlan } from '../orchestrator/pipeline.js';
import { saveHire } from '../utils/fileManager.js';

const router = express.Router();

/**
 * POST /api/plans
 * Generates complete onboarding plan with all deliverables
 */
router.post('/plans', async (req, res) => {
  console.log('\n🚀 POST /api/plans - Generating onboarding plan');

  try {
    const { hireName, jobDescription, assessment, llmConfig } = req.body;

    // Validation
    if (!hireName || typeof hireName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'hireName is required and must be a string'
      });
    }

    if (!jobDescription || typeof jobDescription !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'jobDescription is required and must be a string'
      });
    }

    if (!assessment || typeof assessment !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'assessment is required and must be an object'
      });
    }

    // At least one assessment method required
    if (!assessment.interviewNotes && !assessment.competencyRatings) {
      return res.status(400).json({
        success: false,
        error: 'At least one assessment method required (interviewNotes or competencyRatings)'
      });
    }

    // Generate employee ID from name
    const employeeId = generateEmployeeId(hireName);
    console.log(`👤 Employee: ${hireName} (ID: ${employeeId})`);

    // Prepare input for pipeline
    const input = {
      jobDescription,
      assessment: {
        interviewNotes: assessment.interviewNotes || null,
        competencyRatings: assessment.competencyRatings || null
      }
    };

    const options = {
      llmConfig: llmConfig || {},
      progressCallback: (progress) => {
        // TODO: Emit SSE events for real-time progress
        console.log(`📊 Progress: Step ${progress.currentStep}/${progress.totalSteps} - ${progress.stepName}`);
      }
    };

    // Run orchestration pipeline
    const result = await generateOnboardingPlan(input, options);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
        metadata: result.metadata
      });
    }

    // Save to file system
    await saveHire(employeeId, {
      name: hireName,
      employeeId,
      createdAt: new Date().toISOString(),
      input,
      ...result.data
    });

    console.log(`💾 Saved hire data to: hires/${employeeId}/`);

    // Return success with employee ID
    res.json({
      success: true,
      employeeId,
      message: 'Onboarding plan generated successfully',
      metadata: result.metadata
    });

  } catch (error) {
    console.error('❌ Error generating plan:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate onboarding plan'
    });
  }
});

/**
 * Generate employee ID from name
 */
function generateEmployeeId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\\s]/g, '')
    .replace(/\\s+/g, '-')
    .substring(0, 50);
}

export default router;
