/**
 * Dashboard Endpoints
 * GET /api/dashboard/metrics - Calculate dashboard metrics from all hires
 */

import express from 'express';
import { listHires, loadHire } from '../utils/fileManager.js';

const router = express.Router();

/**
 * GET /api/dashboard/metrics
 * Calculate and return dashboard metrics
 */
router.get('/dashboard/metrics', async (req, res) => {
  console.log('\n📊 GET /api/dashboard/metrics - Calculating metrics');

  try {
    const employees = await listHires();

    if (employees.length === 0) {
      return res.json({
        success: true,
        data: {
          activePlans: 0,
          avgCompletionRate: 0,
          onTrack: 0,
          behind: 0,
          avgDays: 0,
          gapsClosed: 0
        }
      });
    }

    // Load progress data for all employees
    const progressData = [];
    for (const emp of employees) {
      try {
        const hire = await loadHire(emp.employeeId);
        progressData.push({
          employeeId: emp.employeeId,
          createdAt: emp.createdAt,
          readiness: hire.progressTracking.overallReadiness,
          gaps: hire.onboardingPlan.gapAnalysis
        });
      } catch (error) {
        console.warn(`⚠️  Failed to load data for ${emp.employeeId}:`, error.message);
      }
    }

    // Calculate metrics
    const activePlans = progressData.length;

    // Average completion rate (readiness %)
    const totalReadiness = progressData.reduce((sum, p) => sum + p.readiness, 0);
    const avgCompletionRate = Math.round(totalReadiness / activePlans);

    // On track (>= 50% readiness) vs Behind (< 50%)
    const onTrack = progressData.filter(p => p.readiness >= 50).length;
    const behind = progressData.filter(p => p.readiness < 50).length;

    // Average days since creation
    const now = new Date();
    const totalDays = progressData.reduce((sum, p) => {
      const created = new Date(p.createdAt);
      const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    const avgDays = Math.round(totalDays / activePlans);

    // Gaps closed (count of low severity gaps across all employees)
    const gapsClosed = progressData.reduce((sum, p) => {
      const lowSeverityGaps = p.gaps.filter(g => g.severity === 'low').length;
      return sum + lowSeverityGaps;
    }, 0);

    const metrics = {
      activePlans,
      avgCompletionRate,
      onTrack,
      behind,
      avgDays,
      gapsClosed
    };

    console.log(`✅ Metrics calculated:`, metrics);

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('❌ Error calculating metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate metrics'
    });
  }
});

export default router;
