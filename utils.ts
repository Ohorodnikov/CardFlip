import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CSVRow } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fisher-Yates shuffle algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Robust CSV Parser following RFC 4180
 * Handles multiline fields, quoted values, and escaped quotes ("")
 */
export function parseCSV(text: string): CSVRow[] {
  const rows: string[][] = [];
  let currentField = '';
  let inQuotes = false;
  let currentRow: string[] = [];

  // Normalize line endings and handle potential BOM
  const cleanText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip the next quote
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false;
      } else {
        // Character inside quotes (including newlines and commas)
        currentField += char;
      }
    } else {
      if (char === '"') {
        // Start of quoted field
        inQuotes = true;
      } else if (char === ',') {
        // Field separator
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n') {
        // Line separator
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        // Regular character
        currentField += char;
      }
    }
  }

  // Handle the last field and row if the file doesn't end with a newline
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length < 1) return [];

  // Clean headers
  const headers = rows[0].map(h => h.trim().toLowerCase());
  const results: CSVRow[] = [];

  // Process data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip completely empty lines
    if (row.length === 0 || (row.length === 1 && row[0].trim() === '')) continue;

    const entry: any = {};
    headers.forEach((header, index) => {
      if (header) {
        // Ensure index exists in row, else default to empty string
        const rawVal = row[index];
        const val = rawVal !== undefined ? rawVal.trim() : '';
        entry[header] = val;
      }
    });

    // Validate that at least the title exists
    if (entry.title) {
      results.push(entry as CSVRow);
    }
  }

  return results;
}

export function getImageSrc(row: CSVRow): string {
  if (row.image_base64) {
// Check if it already has the prefix, if not, assume standard png/jpg/jpeg
    if (row.image_base64.startsWith('data:')) return row.image_base64;
    return `data:image/jpeg;base64,${row.image_base64}`;
  }
  if (row.image_url) {
    return row.image_url;
  }
// Fallback placeholder - using a highly reliable placeholder service
  return 'https://placehold.co/600x400/4f46e5/ffffff?text=No+Image';
}