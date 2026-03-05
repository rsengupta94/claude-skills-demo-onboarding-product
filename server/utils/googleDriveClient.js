/**
 * Google Drive Client
 * Downloads transcript files from Google Drive
 */

import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let driveClient = null;
let docsClient = null;

/**
 * Initialize Google Drive client with service account
 */
async function initializeDriveClient() {
  if (driveClient) return { drive: driveClient, docs: docsClient };

  try {
    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || './config/service-account-key.json';
    const fullPath = path.resolve(keyPath);

    const keyFile = await fs.readFile(fullPath, 'utf-8');
    const credentials = JSON.parse(keyFile);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/documents.readonly'
      ]
    });

    driveClient = google.drive({ version: 'v3', auth });
    docsClient = google.docs({ version: 'v1', auth });

    console.log('✅ Google Drive client initialized');

    return { drive: driveClient, docs: docsClient };
  } catch (error) {
    console.error('❌ Failed to initialize Google Drive client:', error.message);
    throw new Error(`Google Drive initialization failed: ${error.message}`);
  }
}

/**
 * Extract file ID from Google Drive URL
 * Supports various URL formats:
 * - https://drive.google.com/file/d/{FILE_ID}/view
 * - https://drive.google.com/open?id={FILE_ID}
 * - https://docs.google.com/document/d/{FILE_ID}/edit
 * - Direct file ID
 */
function extractFileId(driveLink) {
  if (!driveLink) {
    throw new Error('Drive link is required');
  }

  // If it's already a file ID (no URL), return as-is
  if (!driveLink.includes('/') && !driveLink.includes('?')) {
    return driveLink;
  }

  // Extract from /file/d/{ID}/ or /document/d/{ID}/
  const fileMatch = driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return fileMatch[1];
  }

  // Extract from ?id={ID}
  const idMatch = driveLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    return idMatch[1];
  }

  throw new Error(`Invalid Google Drive link format: ${driveLink}`);
}

/**
 * Get file metadata from Google Drive
 */
async function getFileMetadata(fileId) {
  const { drive } = await initializeDriveClient();

  try {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size'
    });

    return response.data;
  } catch (error) {
    if (error.code === 404) {
      throw new Error(`File not found in Google Drive: ${fileId}`);
    }
    if (error.message.includes('permission')) {
      throw new Error(`Permission denied. Ensure service account has access to file: ${fileId}`);
    }
    throw new Error(`Failed to get file metadata: ${error.message}`);
  }
}

/**
 * Download transcript from Google Drive
 * @param {string} driveLink - Google Drive URL or file ID
 * @returns {Promise<string>} Transcript text content
 */
export async function downloadTranscript(driveLink) {
  console.log(`📥 Downloading transcript from Google Drive: ${driveLink}`);

  try {
    const fileId = extractFileId(driveLink);
    const metadata = await getFileMetadata(fileId);

    console.log(`📄 File: ${metadata.name} (${metadata.mimeType})`);

    // Handle different file types
    let text = '';

    if (metadata.mimeType === 'application/vnd.google-apps.document') {
      // Google Doc
      text = await downloadGoogleDoc(fileId);
    } else if (metadata.mimeType === 'text/plain') {
      // Plain text file
      text = await downloadTextFile(fileId);
    } else if (metadata.mimeType === 'application/pdf') {
      // PDF file
      text = await downloadPdfFile(fileId);
    } else {
      throw new Error(`Unsupported file type: ${metadata.mimeType}. Supported: Google Docs, .txt, .pdf`);
    }

    console.log(`✅ Downloaded ${text.length} characters from ${metadata.name}`);
    return text;

  } catch (error) {
    console.error('❌ Error downloading transcript:', error.message);
    throw new Error(`Failed to download transcript: ${error.message}`);
  }
}

/**
 * Download Google Doc and convert to plain text
 */
async function downloadGoogleDoc(fileId) {
  const { docs } = await initializeDriveClient();

  try {
    const response = await docs.documents.get({
      documentId: fileId
    });

    // Extract text from document structure
    const doc = response.data;
    let text = '';

    if (doc.body && doc.body.content) {
      for (const element of doc.body.content) {
        if (element.paragraph) {
          for (const elem of element.paragraph.elements) {
            if (elem.textRun) {
              text += elem.textRun.content;
            }
          }
        }
      }
    }

    return text.trim();
  } catch (error) {
    throw new Error(`Failed to download Google Doc: ${error.message}`);
  }
}

/**
 * Download plain text file
 */
async function downloadTextFile(fileId) {
  const { drive } = await initializeDriveClient();

  try {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'text' }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Failed to download text file: ${error.message}`);
  }
}

/**
 * Download PDF file and extract text
 */
async function downloadPdfFile(fileId) {
  const { drive } = await initializeDriveClient();

  try {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    // Parse PDF using pdf-parse
    const pdfData = await pdfParse(Buffer.from(response.data));
    return pdfData.text;
  } catch (error) {
    throw new Error(`Failed to download/parse PDF: ${error.message}`);
  }
}

/**
 * Download multiple transcripts from a folder
 * @param {string} folderId - Google Drive folder ID
 * @returns {Promise<Array>} Array of { fileName, fileId, content }
 */
export async function downloadTranscriptsFromFolder(folderId) {
  console.log(`📂 Reading transcripts from folder: ${folderId}`);

  const { drive } = await initializeDriveClient();

  try {
    // List all files in folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)',
      orderBy: 'name'
    });

    const files = response.data.files;
    console.log(`📁 Found ${files.length} files in folder`);

    // Download each file
    const transcripts = [];
    for (const file of files) {
      try {
        const content = await downloadTranscript(file.id);
        transcripts.push({
          fileName: file.name,
          fileId: file.id,
          content
        });
      } catch (error) {
        console.warn(`⚠️  Failed to download ${file.name}: ${error.message}`);
      }
    }

    console.log(`✅ Downloaded ${transcripts.length} transcripts`);
    return transcripts;

  } catch (error) {
    throw new Error(`Failed to read folder: ${error.message}`);
  }
}

/**
 * Check if service account has access to file/folder
 */
export async function checkAccess(fileOrFolderId) {
  try {
    const metadata = await getFileMetadata(fileOrFolderId);
    console.log(`✅ Access confirmed: ${metadata.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Access check failed: ${error.message}`);
    return false;
  }
}

export default {
  downloadTranscript,
  downloadTranscriptsFromFolder,
  checkAccess
};
