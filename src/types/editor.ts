export interface EditorSelection {
  from: number;
  to: number;
  text: string;
}

export interface DocumentTab {
  path: string;
  content: string;
  savedContent: string;
  selection: EditorSelection;
  saveError: string | null;
  saving: boolean;
}
