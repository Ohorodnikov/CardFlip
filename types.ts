export interface CSVRow {
  title: string;
  description: string;
  image_url?: string;
  image_base64?: string;
  [key: string]: string | undefined;
}

export interface CardData {
  id: string; // Unique identifier for React keys
  displayNumber: number; // The number shown on the front (1 to N)
  title: string;
  description: string;
  imageSrc: string;
}

export interface GameSession {
  id: string;
  name: string;
  cards: CardData[];
  version: number; // Used to force re-renders on reshuffle
}

export enum AppState {
  UPLOAD = 'UPLOAD', // Used conceptually for "New Tab" state
  GRID = 'GRID',
}