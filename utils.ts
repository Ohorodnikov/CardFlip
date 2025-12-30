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
 * Robust CSV Parser following RFC 4180.
 * Handles multiline fields and escaped quotes.
 */
export function parseCSV(text: string): CSVRow[] {
  if (!text) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  // Normalize line endings to avoid issues with different OS formats
  const content = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        // Escaped quote: "" -> "
        currentField += '"';
        i++; // Skip the next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Handle content that doesn't end with a trailing newline
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const results: CSVRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Skip empty lines or lines that are just whitespace
    if (row.length === 0 || (row.length === 1 && row[0].trim() === '')) continue;
    
    const entry: any = {};
    headers.forEach((header, index) => {
      if (header) {
        entry[header] = (row[index] || '').trim();
      }
    });

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
  return 'https://placehold.co/600x400/4f46e5/ffffff?text=No+Image';
}