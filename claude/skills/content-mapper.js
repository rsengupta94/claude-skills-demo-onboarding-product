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

  console.log(`🔍 Batch matching ${gapAnalysis.gaps.length} gaps against ${courseCatalog.length} courses in a single LLM call...`);

  // Single batch LLM call — all gaps × all courses at once
  const batchResults = await batchMatchGapsToCourses(gapAnalysis.gaps, courseCatalog, llm);

  const learningPath = [];
  const unmatchedGaps = [];

  for (const result of batchResults) {
    const course = courseCatalog.find(c => c.title === result.courseTitle);

    if (result.isRelevant && course) {
      learningPath.push({
        sequence: learningPath.length + 1,
        courseId: course.course_id,
        courseTitle: course.title,
        courseUrl: course.coursera_url,
        addresses: result.competency,
        duration: course.duration_hours ? `${course.duration_hours} hours` : 'N/A',
        rationale: result.rationale,
        relevanceScore: result.relevanceScore,
        recommendedModules: result.recommendedModules || []
      });
    } else {
      unmatchedGaps.push({
        competency: result.competency,
        reason: result.isRelevant ? 'Course not found in catalog' : 'No relevant course found'
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
 * Single batch LLM call: match all gaps to best courses in one shot
 */
async function batchMatchGapsToCourses(gaps, courseCatalog, llm) {
  const gapsList = gaps.map((g, i) =>
    `GAP ${i + 1}: ${g.competency}
  - Severity: ${g.severity}
  - Current Level: ${g.currentLevel}/4, Target: ${g.targetLevel}/4
  - Evidence: ${g.evidence}`
  ).join('\n\n');

  const coursesList = courseCatalog.map((c, i) =>
    `COURSE ${i + 1}: ${c.title}
  - Skills: ${c.skills}
  - Description: ${c.description?.substring(0, 300)}
  - Modules: ${c.modules || 'N/A'}`
  ).join('\n\n');

  const prompt = `You are an expert L&D content analyst. Match each skill gap to the single best course from the catalog.

**SKILL GAPS:**
${gapsList}

**COURSE CATALOG:**
${coursesList}

**Your Task:**
For each gap, identify the single best matching course. Use semantic reasoning — not just keyword matching.
- A course is relevant if its content directly helps close the gap
- relevanceScore: 0-100 (mark isRelevant: false if best score is below 40)
- recommendedModules: 1-3 specific modules most relevant to the gap

**Output Format (JSON):**
{
  "matches": [
    {
      "competency": "Communication",
      "courseTitle": "Improving Communication Skills",
      "isRelevant": true,
      "relevanceScore": 88,
      "rationale": "Directly addresses the communication gap through rapport building and persuasion techniques.",
      "recommendedModules": ["Module 1: Trust", "Module 3: Effective Communication"]
    },
    {
      "competency": "Strategic Thinking",
      "courseTitle": "Strategic Thinking",
      "isRelevant": true,
      "relevanceScore": 95,
      "rationale": "Core course on strategic planning and decision-making frameworks.",
      "recommendedModules": ["Module 2: Contingency Planning"]
    }
  ]
}

Return exactly one match object per gap, in the same order as the gaps listed above.
If no course is relevant for a gap, set isRelevant: false and courseTitle to the closest option.`;

  const schema = {
    type: 'object',
    required: ['matches'],
    properties: {
      matches: { type: 'array' }
    }
  };

  try {
    const result = await llm.generateStructured(prompt, schema);
    console.log(`✅ Batch matching complete: ${result.matches.length} gaps matched`);
    return result.matches;
  } catch (error) {
    console.error('Batch course matching failed:', error.message);
    // Return all gaps as unmatched on failure
    return gaps.map(g => ({
      competency: g.competency,
      courseTitle: '',
      isRelevant: false,
      relevanceScore: 0,
      rationale: 'Matching failed',
      recommendedModules: []
    }));
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
