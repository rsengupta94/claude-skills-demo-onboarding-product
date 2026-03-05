/**
 * Google Sheets Client
 * Reads course catalog from Google Sheets
 */

import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sheetsClient = null;

/**
 * Initialize Google Sheets client with service account
 */
async function initializeSheetsClient() {
  if (sheetsClient) return sheetsClient;

  try {
    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || './config/service-account-key.json';
    const fullPath = path.resolve(keyPath);

    const keyFile = await fs.readFile(fullPath, 'utf-8');
    const credentials = JSON.parse(keyFile);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets client initialized');

    return sheetsClient;
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheets client:', error.message);
    throw new Error(`Google Sheets initialization failed: ${error.message}`);
  }
}

/**
 * Read course catalog from Google Sheets
 * @param {string} spreadsheetId - Google Sheets ID (from URL or env)
 * @param {string} range - Sheet range (e.g., "Sheet1!A1:Z100")
 * @returns {Promise<Array>} Array of course objects
 */
export async function readCourseCatalog(spreadsheetId = null, range = 'Sheet1!A:H') {
  const sheetId = spreadsheetId || process.env.GOOGLE_SHEETS_ID;

  if (!sheetId) {
    throw new Error('Google Sheets ID not provided. Set GOOGLE_SHEETS_ID in .env');
  }

  console.log(`📊 Reading course catalog from Google Sheets: ${sheetId}`);

  try {
    const sheets = await initializeSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.warn('⚠️  Google Sheet is empty');
      return [];
    }

    // First row is headers
    const headers = rows[0].map(h => h.trim().toLowerCase().replace(/ /g, '_'));
    const courses = [];

    // Parse data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      // Skip empty rows
      if (!row || row.length === 0 || !row[0]) continue;

      const course = {};

      headers.forEach((header, index) => {
        course[header] = row[index] || '';
      });

      // Generate course_id if not provided
      if (!course.course_id && course.course_title) {
        course.course_id = generateCourseId(course.course_title);
      }

      courses.push(course);
    }

    console.log(`✅ Loaded ${courses.length} courses from Google Sheets`);
    return courses;

  } catch (error) {
    console.error('❌ Error reading Google Sheets:', error.message);

    // If Google API fails, return empty array (graceful degradation)
    if (error.message.includes('authentication') || error.message.includes('permission')) {
      console.error('⚠️  Authentication issue - check service account setup');
    }

    throw new Error(`Failed to read Google Sheets: ${error.message}`);
  }
}

/**
 * Generate course ID from title
 */
function generateCourseId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

/**
 * Get sheet metadata (for debugging)
 */
export async function getSheetInfo(spreadsheetId = null) {
  const sheetId = spreadsheetId || process.env.GOOGLE_SHEETS_ID;

  if (!sheetId) {
    throw new Error('Google Sheets ID not provided');
  }

  try {
    const sheets = await initializeSheetsClient();

    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId
    });

    return {
      title: response.data.properties.title,
      sheets: response.data.sheets.map(s => s.properties.title),
      url: `https://docs.google.com/spreadsheets/d/${sheetId}`
    };
  } catch (error) {
    throw new Error(`Failed to get sheet info: ${error.message}`);
  }
}

export default {
  readCourseCatalog,
  getSheetInfo
};
