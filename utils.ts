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
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const results: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    if (!currentLine) continue;

    // Handle quoted values correctly
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    for (let char of currentLine) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim().replace(/^"|"$/g, ''));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim().replace(/^"|"$/g, ''));

    const entry: any = {};
    headers.forEach((header, index) => {
      if (values[index] !== undefined) {
        entry[header] = values[index];
      }
    });

    // Validate required fields roughly
    if (entry.title) {
        results.push(entry);
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
  // Fallback placeholder
  return 'https://picsum.photos/400/600';
}
