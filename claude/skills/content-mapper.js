/**
 * Content Mapper Skill
 * Maps skill gaps to courses using descriptions and recommends specific modules
 */

import { getLLMProvider } from '../../server/llm/provider.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_PATH = path.join(__dirname, '../../data/courses/course-catalog.csv');

/**
 * Map gaps to learning content with module-level recommendations
 * @param {object} gapAnalysis - From gap-identifier
 * @param {object} options - Optional configuration
 * @returns {Promise<object>} Learning path with courses, modules, and unmatched gaps
 */
export async function mapContent(gapAnalysis, options = {}) {
  console.log('📚 Mapping gaps to learning content...');

  // Load course catalog
  const courseCatalog = await loadCourseCatalog();
  console.log(`📖 Loaded ${courseCatalog.length} courses from catalog`);

  if (courseCatalog.length === 0) {
    console.warn('⚠️  No courses in catalog - returning empty learning path');
    return {
      learningPath: [],
      unmatchedGaps: gapAnalysis.gaps.map(g => ({
        competency: g.competency,
        reason: 'No courses available in catalog'
      }))
    };
  }

  // Get LLM provider
  const llm = getLLMProvider(options.llmConfig);

  // Process all gaps in parallel
  const results = await Promise.all(
    gapAnalysis.gaps.map(async (gap) => {
      console.log(`🔍 Finding content for: ${gap.competency} (${gap.severity} severity)`);
      try {
        const match = await findBestCourseForGap(gap, courseCatalog, llm);
        return { gap, match };
      } catch (error) {
        console.error(`Error mapping ${gap.competency}:`, error.message);
        return { gap, match: null, error: error.message };
      }
    })
  );

  const learningPath = [];
  const unmatchedGaps = [];

  for (const { gap, match, error } of results) {
    if (match) {
      learningPath.push({
        sequence: learningPath.length + 1,
        courseId: match.course_id,
        courseTitle: match.title,
        courseUrl: match.coursera_url,
        addresses: gap.competency,
        duration: match.duration_hours ? `${match.duration_hours} hours` : 'N/A',
        rationale: match.rationale,
        relevanceScore: match.relevanceScore,
        recommendedModules: match.recommendedModules || []
      });
    } else {
      unmatchedGaps.push({
        competency: gap.competency,
        reason: error ? `Error: ${error}` : 'No course content addresses this skill gap'
      });
    }
  }

  // Sort learning path by gap priority and relevance
  learningPath.sort((a, b) => {
    const gapA = gapAnalysis.gaps.find(g => g.competency === a.addresses);
    const gapB = gapAnalysis.gaps.find(g => g.competency === b.addresses);
    return (gapA?.priority || 99) - (gapB?.priority || 99);
  });

  // Update sequence numbers
  learningPath.forEach((item, index) => {
    item.sequence = index + 1;
  });

  console.log(`✅ Learning path created: ${learningPath.length} courses, ${unmatchedGaps.length} unmatched gaps`);

  return {
    learningPath,
    unmatchedGaps
  };
}

/**
 * Find best course for a specific gap
 */
async function findBestCourseForGap(gap, courseCatalog, llm) {
  // Filter courses by skill tags (initial filter)
  const potentialCourses = courseCatalog.filter(course => {
    const skills = (course.skills || '').toLowerCase();
    const competency = gap.competency.toLowerCase();
    // Check if any skill tag matches the competency
    return skills.split('|').some(skill =>
      skill.trim().includes(competency) ||
      competency.includes(skill.trim()) ||
      skill.trim().split(' ')[0] === competency.split(' ')[0]
    );
  });

  if (potentialCourses.length === 0) {
    // No skill tag match, try all courses (semantic matching)
    console.log(`  No courses with matching skill tags, analyzing all courses...`);
  }

  const coursesToAnalyze = potentialCourses.length > 0 ? potentialCourses : courseCatalog;

  // Analyze all courses in parallel
  const analyses = await Promise.all(
    coursesToAnalyze.map(async (course) => {
      const analysis = await analyzeCourseRelevance(gap, course, llm);
      return { course, analysis };
    })
  );

  let bestMatch = null;
  let highestScore = 0;

  for (const { course, analysis } of analyses) {
    if (analysis.isRelevant && analysis.relevanceScore > highestScore) {
      highestScore = analysis.relevanceScore;
      bestMatch = {
        ...course,
        rationale: analysis.rationale,
        relevanceScore: analysis.relevanceScore,
        recommendedModules: analysis.recommendedModules
      };
    }
  }

  return bestMatch;
}

/**
 * Analyze course relevance using LLM
 */
async function analyzeCourseRelevance(gap, course, llm) {
  const prompt = `You are an expert L&D content analyst. Determine if this course addresses the identified skill gap and recommend specific modules.

**Skill Gap:**
- Competency: ${gap.competency}
- Severity: ${gap.severity}
- Current Level: ${gap.currentLevel}/4
- Target Level: ${gap.targetLevel}/4
- Evidence: ${gap.evidence}

**Course:**
- Title: ${course.title}
- Skill Tags: ${course.skills}
- Description: ${course.description}
- Learning Objectives: ${course.learning_objectives}

**Available Modules:**
${course.modules || 'Module information not available'}

**Your Task:**

Analyze if this course content addresses the skill gap:

1. **Does the course teach this skill?**
   - Look at description and learning objectives
   - Consider semantic relevance, not just keyword matching
   - Examples: "stakeholder management" relates to "communication" and "collaboration"

2. **How well does it address the gap?**
   - Relevance Score: 0-100 (0 = not relevant, 100 = perfectly addresses gap)
   - 80-100: Directly teaches the needed skill with practical applications
   - 60-79: Covers important aspects of the skill
   - 40-59: Touches on the skill but not comprehensive
   - 0-39: Minimal or no relevance

3. **Which modules are most relevant?** (if module descriptions available)
   - Recommend 2-4 specific modules that directly address the gap
   - Skip modules that are too basic or not directly relevant
   - Consider the current level (${gap.currentLevel}) vs target level (${gap.targetLevel})
   - Format: ["Module 2: Title", "Module 4: Title"]

4. **Provide rationale:**
   - What specific learning objectives address the gap?
   - How will it help close the gap?
   - Why these specific modules?

**Output Format (JSON):**
{
  "isRelevant": true,
  "relevanceScore": 85,
  "rationale": "This course directly addresses the communication gap with learning objectives focused on executive-level stakeholder engagement and cross-cultural communication. Module 2 covers data storytelling (critical for presenting to executives) and Module 4 teaches influencing without authority (key for stakeholder management).",
  "recommendedModules": [
    "Module 2: Data Storytelling - Transforming numbers into compelling narratives",
    "Module 4: Influencing Without Authority - Building credibility and driving decisions"
  ]
}

If not relevant:
{
  "isRelevant": false,
  "relevanceScore": 25,
  "rationale": "Course focuses on written communication fundamentals, which doesn't address the need for executive-level strategic presentations and stakeholder influence.",
  "recommendedModules": []
}

**Important:**
- Be selective with modules - only recommend those directly relevant to the gap
- Consider the skill level (don't recommend basics if current level is 2+)
- If no module descriptions available, return empty array for recommendedModules`;

  const schema = {
    type: 'object',
    required: ['isRelevant', 'relevanceScore', 'rationale', 'recommendedModules'],
    properties: {
      isRelevant: { type: 'boolean' },
      relevanceScore: { type: 'number' },
      rationale: { type: 'string' },
      recommendedModules: { type: 'array' }
    }
  };

  try {
    const result = await llm.generateStructured(prompt, schema);
    return result;
  } catch (error) {
    console.error(`Error analyzing course ${course.course_id}:`, error.message);
    return {
      isRelevant: false,
      relevanceScore: 0,
      rationale: 'Analysis failed',
      recommendedModules: []
    };
  }
}

/**
 * Load course catalog from CSV and transform to internal format
 */
async function loadCourseCatalog() {
  try {
    const fileContent = await fs.readFile(CATALOG_PATH, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Transform CSV format to internal format
    const transformed = records.map(row => {
      // Build modules array from module columns
      const modules = [];
      for (let i = 1; i <= 4; i++) {
        const moduleName = row[`module ${i} name`];
        const moduleDesc = row[`module ${i} description`];

        if (moduleName && moduleName.trim()) {
          modules.push(`Module ${i}: ${moduleName}${moduleDesc ? ' - ' + moduleDesc : ''}`);
        }
      }

      return {
        course_id: generateCourseId(row['course name'] || ''),
        title: row['course name'] || '',
        provider: row['partner'] || 'Coursera',
        skills: row['Skills'] || '',
        coursera_url: row['coursera link'] || '',
        description: row['course description'] || '',
        learning_objectives: '', // Not in CSV, will use description
        modules: modules.join('|')
      };
    });

    return transformed;
  } catch (error) {
    console.warn('Course catalog not found or empty, returning empty catalog');
    console.warn('Error:', error.message);
    return [];
  }
}

/**
 * Generate course ID from title
 */
function generateCourseId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\\s]/g, '')
    .replace(/\\s+/g, '-')
    .substring(0, 50);
}

export default {
  mapContent
};
