import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CSVRow } from './types';

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

// Simple CSV Parser
export function parseCSV(text: string): CSVRow[] {
  if (!text) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote ("")
        currentField += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i++; // skip \n
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Final field
  if (currentField !== '' || currentRow.length) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const results: CSVRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Skip empty rows
    if (row.every(cell => !cell)) continue;

    const entry: Partial<CSVRow> = {};

    headers.forEach((header, index) => {
      if (!header) return;
      entry[header] = row[index] ?? '';
    });

    // Required field check
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