/**
 * Employees Endpoints
 * GET /api/employees - List all employees
 * GET /api/employees/:id/onboarding-plan - Get onboarding plan
 * GET /api/employees/:id/manager-toolkit - Get manager toolkit
 * GET /api/employees/:id/progress-tracking - Get progress tracking
 */

import express from 'express';
import { listHires, loadHire, hireExists } from '../utils/fileManager.js';

const router = express.Router();

/**
 * GET /api/employees
 * Returns list of all employees with metadata
 */
router.get('/employees', async (req, res) => {
  console.log('\n👥 GET /api/employees - Listing all employees');

  try {
    const employees = await listHires();

    res.json({
      success: true,
      count: employees.length,
      data: employees
    });

  } catch (error) {
    console.error('❌ Error listing employees:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list employees'
    });
  }
});

/**
 * GET /api/employees/:id/onboarding-plan
 * Returns gap analysis, learning path, and 30/60/90 plan
 */
router.get('/employees/:id/onboarding-plan', async (req, res) => {
  const { id } = req.params;
  console.log(`\n📋 GET /api/employees/${id}/onboarding-plan`);

  try {
    // Check if hire exists
    const exists = await hireExists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: `Employee not found: ${id}`
      });
    }

    // Load hire data
    const hire = await loadHire(id);

    res.json({
      success: true,
      data: {
        employeeId: id,
        name: hire.metadata.name,
        roleTitle: hire.metadata.roleTitle,
        gapAnalysis: hire.onboardingPlan.gapAnalysis,
        learningPath: hire.onboardingPlan.learningPath,
        plan306090: hire.onboardingPlan.plan306090,
        unmatchedGaps: hire.onboardingPlan.unmatchedGaps || []
      }
    });

  } catch (error) {
    console.error(`❌ Error loading onboarding plan for ${id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load onboarding plan'
    });
  }
});

/**
 * GET /api/employees/:id/manager-toolkit
 * Returns manager support materials
 */
router.get('/employees/:id/manager-toolkit', async (req, res) => {
  const { id } = req.params;
  console.log(`\n🧰 GET /api/employees/${id}/manager-toolkit`);

  try {
    // Check if hire exists
    const exists = await hireExists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: `Employee not found: ${id}`
      });
    }

    // Load hire data
    const hire = await loadHire(id);

    res.json({
      success: true,
      data: {
        employeeId: id,
        name: hire.metadata.name,
        focusAreas: hire.managerToolkit.focusAreas,
        checkIns: hire.managerToolkit.checkIns,
        supportTips: hire.managerToolkit.supportTips
      }
    });

  } catch (error) {
    console.error(`❌ Error loading manager toolkit for ${id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load manager toolkit'
    });
  }
});

/**
 * GET /api/employees/:id/progress-tracking
 * Returns progress tracking framework
 */
router.get('/employees/:id/progress-tracking', async (req, res) => {
  const { id } = req.params;
  console.log(`\n📊 GET /api/employees/${id}/progress-tracking`);

  try {
    // Check if hire exists
    const exists = await hireExists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: `Employee not found: ${id}`
      });
    }

    // Load hire data
    const hire = await loadHire(id);

    res.json({
      success: true,
      data: {
        employeeId: id,
        name: hire.metadata.name,
        overallReadiness: hire.progressTracking.overallReadiness,
        phases: hire.progressTracking.phases,
        learningChecklist: hire.progressTracking.learningChecklist,
        skillProgression: hire.progressTracking.skillProgression
      }
    });

  } catch (error) {
    console.error(`❌ Error loading progress tracking for ${id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load progress tracking'
    });
  }
});

export default router;
