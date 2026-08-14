export interface SearchResult {
  fileName: string;
  path: string;
  snippet: string;
  matchCount: number;
  line: number;
}

export interface ActivitySummary {
  createdFiles: number;
  editedFiles: number;
  totalWordsAdded: number;
  recentFiles: string[];
  mostEdited: Array<{ path: string; edits: number }>;
  days: Array<{ day: string; edits: number; wordsAdded: number }>;
}
