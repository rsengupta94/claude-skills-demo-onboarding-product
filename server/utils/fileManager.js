/**
 * File Manager
 * Handles saving/loading hire data to/from file system
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HIRES_DIR = path.join(__dirname, '../../hires');

/**
 * Ensure hires directory exists
 */
async function ensureHiresDir() {
  try {
    await fs.access(HIRES_DIR);
  } catch {
    await fs.mkdir(HIRES_DIR, { recursive: true });
  }
}

/**
 * Save hire data to file system
 * @param {string} employeeId - Unique employee identifier
 * @param {object} data - Complete hire data
 */
export async function saveHire(employeeId, data) {
  await ensureHiresDir();

  const employeeDir = path.join(HIRES_DIR, employeeId);

  // Create employee directory
  await fs.mkdir(employeeDir, { recursive: true });

  // Save metadata
  await fs.writeFile(
    path.join(employeeDir, 'metadata.json'),
    JSON.stringify({
      name: data.name,
      employeeId: data.employeeId,
      roleTitle: data.metadata?.roleTitle,
      createdAt: data.createdAt,
      llmProvider: data.metadata?.llmProvider
    }, null, 2)
  );

  // Save input data
  await fs.writeFile(
    path.join(employeeDir, 'input.json'),
    JSON.stringify(data.input, null, 2)
  );

  // Save onboarding plan (gap analysis, learning path, 30/60/90)
  await fs.writeFile(
    path.join(employeeDir, 'onboarding-plan.json'),
    JSON.stringify(data.onboardingPlan, null, 2)
  );

  // Save manager toolkit
  await fs.writeFile(
    path.join(employeeDir, 'manager-toolkit.json'),
    JSON.stringify(data.managerToolkit, null, 2)
  );

  // Save progress tracking
  await fs.writeFile(
    path.join(employeeDir, 'progress-tracking.json'),
    JSON.stringify(data.progressTracking, null, 2)
  );

  console.log(`✅ Saved hire data for ${employeeId}`);
}

/**
 * Load hire data from file system
 * @param {string} employeeId - Unique employee identifier
 * @returns {Promise<object>} Complete hire data
 */
export async function loadHire(employeeId) {
  const employeeDir = path.join(HIRES_DIR, employeeId);

  try {
    const [metadata, input, onboardingPlan, managerToolkit, progressTracking] = await Promise.all([
      fs.readFile(path.join(employeeDir, 'metadata.json'), 'utf-8').then(JSON.parse),
      fs.readFile(path.join(employeeDir, 'input.json'), 'utf-8').then(JSON.parse),
      fs.readFile(path.join(employeeDir, 'onboarding-plan.json'), 'utf-8').then(JSON.parse),
      fs.readFile(path.join(employeeDir, 'manager-toolkit.json'), 'utf-8').then(JSON.parse),
      fs.readFile(path.join(employeeDir, 'progress-tracking.json'), 'utf-8').then(JSON.parse)
    ]);

    return {
      metadata,
      input,
      onboardingPlan,
      managerToolkit,
      progressTracking
    };
  } catch (error) {
    throw new Error(`Failed to load hire data for ${employeeId}: ${error.message}`);
  }
}

/**
 * List all employee IDs
 * @returns {Promise<Array>} Array of employee metadata
 */
export async function listHires() {
  await ensureHiresDir();

  try {
    const entries = await fs.readdir(HIRES_DIR, { withFileTypes: true });
    const directories = entries.filter(entry => entry.isDirectory());

    const employees = [];

    for (const dir of directories) {
      try {
        const metadataPath = path.join(HIRES_DIR, dir.name, 'metadata.json');
        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
        employees.push(metadata);
      } catch (error) {
        console.warn(`⚠️  Failed to read metadata for ${dir.name}:`, error.message);
      }
    }

    // Sort by creation date (newest first)
    employees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return employees;
  } catch (error) {
    console.error('Error listing hires:', error);
    return [];
  }
}

/**
 * Check if hire exists
 * @param {string} employeeId - Unique employee identifier
 * @returns {Promise<boolean>} True if hire exists
 */
export async function hireExists(employeeId) {
  const employeeDir = path.join(HIRES_DIR, employeeId);

  try {
    await fs.access(employeeDir);
    return true;
  } catch {
    return false;
  }
}

export default {
  saveHire,
  loadHire,
  listHires,
  hireExists
};
