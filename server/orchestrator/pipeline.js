/**
 * Orchestration Pipeline
 * Coordinates all 8 Claude Skills to generate complete onboarding plan
 */

import { analyzeJobDescription } from '../../claude/skills/jd-analyzer.js';
import { assessFromInterview } from '../../claude/skills/interview-assessor.js';
import { processRatings, mergeAssessments } from '../../claude/skills/rating-processor.js';
import { identifyGaps } from '../../claude/skills/gap-identifier.js';
import { mapContent } from '../../claude/skills/content-mapper.js';
import { generatePlan } from '../../claude/skills/plan-generator.js';
import { generateToolkit } from '../../claude/skills/toolkit-generator.js';
import { generateProgressFramework } from '../../claude/skills/progress-generator.js';

/**
 * Generate complete onboarding plan
 * @param {object} input - Job description and assessment data
 * @param {object} options - Configuration options
 * @returns {Promise<object>} Complete onboarding plan with all deliverables
 */
export async function generateOnboardingPlan(input, options = {}) {
  console.log('\n🚀 Starting Onboarding Plan Generation Pipeline...\n');

  const startTime = Date.now();
  const pipeline = {
    status: 'processing',
    currentStep: 0,
    totalSteps: 8,
    results: {}
  };

  try {
    // ============================================
    // STEP 1: Analyze Job Description
    // ============================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 STEP 1/8: Analyzing Job Description');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    pipeline.currentStep = 1;
    emitProgress(pipeline, 'analyzing-jd', options.progressCallback);

    const step1Start = Date.now();
    const jdAnalysis = await analyzeJobDescription(
      input.jobDescription,
      options.llmConfig
    );

    pipeline.results.jdAnalysis = jdAnalysis;
    console.log(`✅ Extracted ${jdAnalysis.requiredCompetencies.length} competencies [${((Date.now() - step1Start) / 1000).toFixed(2)}s]`);
    if (jdAnalysis.newBuckets.length > 0) {
      console.log(`✨ Created ${jdAnalysis.newBuckets.length} new skill bucket(s)`);
    }

    // ============================================
    // STEP 2: Assess Candidate
    // ============================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 STEP 2/8: Assessing Candidate');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    pipeline.currentStep = 2;
    emitProgress(pipeline, 'assessing-candidate', options.progressCallback);

    let candidateAssessment = null;

    // Process interview notes if provided
    const step2Start = Date.now();
    if (input.assessment.interviewNotes) {
      console.log('📝 Processing interview notes...');
      const interviewAssessment = await assessFromInterview(
        input.assessment.interviewNotes,
        jdAnalysis.requiredCompetencies,
        options.llmConfig
      );
      candidateAssessment = interviewAssessment;
    }

    // Process competency ratings if provided
    if (input.assessment.competencyRatings && input.assessment.competencyRatings.length > 0) {
      console.log('📊 Processing competency ratings...');
      const ratingAssessment = await processRatings(
        input.assessment.competencyRatings,
        options.llmConfig
      );

      // Merge with interview assessment if both exist
      if (candidateAssessment) {
        candidateAssessment = mergeAssessments(candidateAssessment, ratingAssessment);
      } else {
        candidateAssessment = ratingAssessment;
      }
    }

    if (!candidateAssessment) {
      throw new Error('No assessment data provided (need interview notes or ratings)');
    }

    pipeline.results.candidateAssessment = candidateAssessment;
    console.log(`✅ Assessment complete: ${candidateAssessment.competencyScores.length} competencies assessed [${((Date.now() - step2Start) / 1000).toFixed(2)}s]`);

    // ============================================
    // STEP 3: Identify Gaps
    // ============================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 STEP 3/8: Identifying Skill Gaps');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    pipeline.currentStep = 3;
    emitProgress(pipeline, 'identifying-gaps', options.progressCallback);

    const step3Start = Date.now();
    const gapAnalysis = await identifyGaps(
      jdAnalysis,
      candidateAssessment,
      options.llmConfig
    );

    pipeline.results.gapAnalysis = gapAnalysis;
    console.log(`✅ Identified ${gapAnalysis.gaps.length} skill gaps [${((Date.now() - step3Start) / 1000).toFixed(2)}s]`);
    gapAnalysis.gaps.slice(0, 3).forEach(g => {
      console.log(`   • ${g.competency}: ${g.severity} severity`);
    });

    // ============================================
    // STEP 4: Map Learning Content
    // ============================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📚 STEP 4/8: Mapping Learning Content');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    pipeline.currentStep = 4;
    emitProgress(pipeline, 'mapping-content', options.progressCallback);

    const step4Start = Date.now();
    const learningPath = await mapContent(
      gapAnalysis,
      options.llmConfig
    );

    pipeline.results.learningPath = learningPath;
    console.log(`✅ Learning path created: ${learningPath.learningPath.length} courses [${((Date.now() - step4Start) / 1000).toFixed(2)}s]`);
    if (learningPath.unmatchedGaps.length > 0) {
      console.log(`⚠️  ${learningPath.unmatchedGaps.length} gaps without course matches`);
    }

    // ============================================
    // STEP 5-7: Generate Deliverables (Parallel)
    // ============================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 STEP 5-7/8: Generating Deliverables');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    pipeline.currentStep = 5;
    emitProgress(pipeline, 'generating-deliverables', options.progressCallback);

    // Run these in parallel for efficiency
    const step57Start = Date.now();
    const [plan306090, managerToolkit, progressFramework] = await Promise.all([
      generatePlan(gapAnalysis, learningPath, options.llmConfig),
      generateToolkit(gapAnalysis, candidateAssessment, options.llmConfig),
      generateProgressFramework(learningPath, null, gapAnalysis, options.llmConfig)
    ]);

    pipeline.results.plan306090 = plan306090;
    pipeline.results.managerToolkit = managerToolkit;
    pipeline.results.progressFramework = progressFramework;

    console.log(`✅ 30/60/90 Plan generated`);
    console.log(`✅ Manager Toolkit generated`);
    console.log(`✅ Progress Framework generated`);
    console.log(`⏱️  Steps 5-7 (parallel): ${((Date.now() - step57Start) / 1000).toFixed(2)}s`);

    // ============================================
    // STEP 8: Finalize and Package
    // ============================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 STEP 8/8: Finalizing Onboarding Plan');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    pipeline.currentStep = 8;
    emitProgress(pipeline, 'finalizing', options.progressCallback);

    // Package all results
    const onboardingPlan = {
      metadata: {
        roleTitle: jdAnalysis.roleTitle,
        generatedAt: new Date().toISOString(),
        llmProvider: options.llmConfig?.provider || process.env.LLM_PROVIDER || 'openai'
      },
      onboardingPlan: {
        gapAnalysis: gapAnalysis.gaps,
        learningPath: learningPath.learningPath,
        plan306090: plan306090.phases
      },
      managerToolkit: {
        focusAreas: managerToolkit.developmentSummary.focusAreas,
        checkIns: managerToolkit.conversationPrompts,
        supportTips: managerToolkit.supportTips
      },
      progressTracking: {
        overallReadiness: progressFramework.overallReadiness,
        phases: progressFramework.phases,
        learningChecklist: progressFramework.learningChecklist,
        skillProgression: progressFramework.skillProgression
      },
      unmatchedGaps: learningPath.unmatchedGaps
    };

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ PIPELINE COMPLETE!');
    console.log(`⏱️  Total time: ${duration}s`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    pipeline.status = 'completed';
    pipeline.currentStep = 8;
    emitProgress(pipeline, 'completed', options.progressCallback);

    return {
      success: true,
      data: onboardingPlan,
      metadata: {
        duration: parseFloat(duration),
        stepsCompleted: 8
      }
    };

  } catch (error) {
    console.error('\n❌ PIPELINE FAILED:', error.message);
    console.error(error.stack);

    pipeline.status = 'failed';
    emitProgress(pipeline, 'failed', options.progressCallback);

    return {
      success: false,
      error: error.message,
      metadata: {
        failedAtStep: pipeline.currentStep,
        stepsCompleted: pipeline.currentStep - 1
      }
    };
  }
}

/**
 * Emit progress update
 */
function emitProgress(pipeline, stepName, callback) {
  const progress = {
    status: pipeline.status,
    currentStep: pipeline.currentStep,
    totalSteps: pipeline.totalSteps,
    stepName,
    timestamp: new Date().toISOString()
  };

  if (callback && typeof callback === 'function') {
    callback(progress);
  }
}

export default {
  generateOnboardingPlan
};
