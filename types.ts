export interface Student {
  id: string;
  name: string;
  gradeLevel?: string;
  createdAt: string;
}

export enum ErrorCategory {
  Spelling = 'Spelling',
  Grammar = 'Grammar',
  Punctuation = 'Punctuation',
  Capitalization = 'Capitalization',
  Syntax = 'Syntax',
  Vocabulary = 'Vocabulary',
  Other = 'Other'
}

export interface DetectedError {
  originalText: string;
  correction: string;
  category: ErrorCategory;
  explanation: string;
}

export interface ScanResult {
  id: string;
  studentId: string;
  timestamp: string;
  imageUrl?: string; // Optional: In a real app we might store URL, here maybe base64 thumbnail
  summary: string;
  errors: DetectedError[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
}
