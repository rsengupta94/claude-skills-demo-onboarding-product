/**
 * Taxonomy Manager
 * Handles reading and writing skill-taxonomy.json with dynamic updates
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TAXONOMY_PATH = path.join(__dirname, '../../data/skill-taxonomy.json');

/**
 * Load the skill taxonomy from file
 * @returns {Promise<object>} Taxonomy object
 */
export async function loadTaxonomy() {
  try {
    const data = await fs.readFile(TAXONOMY_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading taxonomy:', error.message);
    throw new Error(`Failed to load skill taxonomy: ${error.message}`);
  }
}

/**
 * Save the skill taxonomy to file
 * @param {object} taxonomy - Taxonomy object to save
 */
export async function saveTaxonomy(taxonomy) {
  try {
    const data = JSON.stringify(taxonomy, null, 2);
    await fs.writeFile(TAXONOMY_PATH, data, 'utf-8');
    console.log('✅ Taxonomy saved successfully');
  } catch (error) {
    console.error('Error saving taxonomy:', error.message);
    throw new Error(`Failed to save skill taxonomy: ${error.message}`);
  }
}

/**
 * Add new skill groups to the taxonomy
 * @param {Array} newBuckets - Array of new skill group objects
 * @returns {Promise<object>} Updated taxonomy
 */
export async function addDynamicBuckets(newBuckets) {
  if (!newBuckets || newBuckets.length === 0) {
    return await loadTaxonomy();
  }

  const taxonomy = await loadTaxonomy();

  for (const bucket of newBuckets) {
    const category = bucket.category || 'behavioral';

    // Check if bucket already exists
    const existingBucket = taxonomy[category]?.find(
      g => g.group_id === bucket.groupId || g.group_name === bucket.groupName
    );

    if (existingBucket) {
      console.log(`⚠️  Bucket "${bucket.groupName}" already exists, skipping`);
      continue;
    }

    // Create new bucket object
    const newBucket = {
      group_id: bucket.groupId,
      group_name: bucket.groupName,
      covers: bucket.covers || [],
      source: 'dynamic'
    };

    // Add to appropriate category
    if (!taxonomy[category]) {
      taxonomy[category] = [];
    }

    taxonomy[category].push(newBucket);
    console.log(`✨ Added dynamic bucket: ${bucket.groupName} (${category})`);
  }

  await saveTaxonomy(taxonomy);
  return taxonomy;
}

/**
 * Get all skill groups as a flat array
 * @returns {Promise<Array>} Array of all skill groups
 */
export async function getAllSkillGroups() {
  const taxonomy = await loadTaxonomy();
  const allGroups = [];

  for (const category in taxonomy) {
    for (const group of taxonomy[category]) {
      allGroups.push({
        ...group,
        category
      });
    }
  }

  return allGroups;
}

/**
 * Find skill group by name or ID
 * @param {string} identifier - Group name or ID
 * @returns {Promise<object|null>} Skill group or null
 */
export async function findSkillGroup(identifier) {
  const allGroups = await getAllSkillGroups();
  return allGroups.find(
    g => g.group_id === identifier ||
         g.group_name.toLowerCase() === identifier.toLowerCase()
  ) || null;
}
