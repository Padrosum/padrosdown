import { open } from "@tauri-apps/plugin-dialog";
import { load } from "@tauri-apps/plugin-store";
import type { FileNode } from "../types/workspace";
import type { ActivitySummary, SearchResult } from "../types/search";
import { tauriClient } from "./tauriClient";

const STORE_PATH = "settings.json";
const WORKSPACE_KEY = "workspacePath";

async function settingsStore() {
  return load(STORE_PATH, { autoSave: false, defaults: {} });
}

export const workspaceService = {
  async chooseWorkspace(): Promise<string | null> {
    const selected = await open({ directory: true, multiple: false, title: "Çalışma alanını seç" });
    return typeof selected === "string" ? selected : null;
  },

  setWorkspace(path: string): Promise<string> {
    return tauriClient.invoke<string>("set_workspace", { path });
  },

  async rememberWorkspace(path: string): Promise<void> {
    const store = await settingsStore();
    await store.set(WORKSPACE_KEY, path);
    await store.save();
  },

  async restoreWorkspace(): Promise<string | null> {
    const store = await settingsStore();
    const value = await store.get<unknown>(WORKSPACE_KEY);
    return typeof value === "string" ? value : null;
  },

  listFiles(): Promise<FileNode[]> {
    return tauriClient.invoke<FileNode[]>("list_workspace_files");
  },

  readFile(path: string): Promise<string> {
    return tauriClient.invoke<string>("read_markdown_file", { path });
  },

  writeFile(path: string, content: string): Promise<void> {
    return tauriClient.invoke<void>("write_markdown_file", { path, content });
  },

  createFile(path: string, content = ""): Promise<void> {
    return tauriClient.invoke<void>("create_markdown_file", { path, content });
  },

  createFolder(path: string): Promise<void> {
    return tauriClient.invoke<void>("create_folder", { path });
  },

  moveEntry(source: string, destination: string): Promise<void> {
    return tauriClient.invoke<void>("move_workspace_entry", { source, destination });
  },

  trashEntry(path: string): Promise<void> {
    return tauriClient.invoke<void>("trash_workspace_entry", { path });
  },

  search(query: string): Promise<SearchResult[]> {
    return tauriClient.invoke<SearchResult[]>("search_workspace", { query });
  },

  activitySummary(): Promise<ActivitySummary> {
    return tauriClient.invoke<ActivitySummary>("activity_summary");
  },

  setActivityTracking(enabled: boolean): Promise<void> {
    return tauriClient.invoke<void>("set_activity_tracking", { enabled });
  },
};
