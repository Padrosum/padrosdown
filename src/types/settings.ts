export type ThemeSetting = "light" | "dark" | "system";

export interface AppSettings {
  theme: ThemeSetting;
  editorFontSize: number;
  editorFontFamily: string;
  lineWrapping: boolean;
  autosaveDelay: number;
  dailyFolder: string;
  inboxFolder: string;
  restoreSession: boolean;
  activityTracking: boolean;
  shortcuts: Record<string, string>;
}

export const defaultSettings: AppSettings = {
  theme: "system",
  editorFontSize: 14,
  editorFontFamily: "JetBrains Mono, Noto Sans Mono, monospace",
  lineWrapping: true,
  autosaveDelay: 600,
  dailyFolder: "daily",
  inboxFolder: "inbox",
  restoreSession: true,
  activityTracking: true,
  shortcuts: {
    openWorkspace: "Ctrl+O",
    newFile: "Ctrl+N",
    quickCapture: "Ctrl+Shift+N",
    save: "Ctrl+S",
    fileSearch: "Ctrl+P",
    commandPalette: "Ctrl+K",
    dailyNote: "Ctrl+Shift+D",
    editorSearch: "Ctrl+F",
    workspaceSearch: "Ctrl+Shift+F",
    closeTab: "Ctrl+W",
    nextTab: "Ctrl+Tab",
    previousTab: "Ctrl+Shift+Tab",
    settings: "Ctrl+,",
  },
};
