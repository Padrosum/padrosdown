import { create } from "zustand";
import type { FileNode, OpenDocument } from "../types/workspace";
import { workspaceService } from "../services/workspaceService";
import { useTabStore } from "./tabStore";

interface WorkspaceState {
  rootPath: string | null;
  tree: FileNode[];
  activeDocument: OpenDocument | null;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  chooseWorkspace: () => Promise<void>;
  openWorkspace: (path: string) => Promise<void>;
  refreshTree: () => Promise<void>;
  openFile: (path: string) => Promise<void>;
  clearError: () => void;
  setError: (error: string) => void;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  rootPath: null,
  tree: [],
  activeDocument: null,
  loading: false,
  error: null,

  initialize: async () => {
    try {
      const restored = await workspaceService.restoreWorkspace();
      if (restored) await get().openWorkspace(restored);
    } catch (error) {
      set({ error: `Çalışma alanı geri yüklenemedi: ${errorMessage(error)}` });
    }
  },

  chooseWorkspace: async () => {
    try {
      const selected = await workspaceService.chooseWorkspace();
      if (selected) await get().openWorkspace(selected);
    } catch (error) {
      set({ error: `Çalışma alanı açılamadı: ${errorMessage(error)}` });
    }
  },

  openWorkspace: async (path) => {
    set({ loading: true, error: null });
    try {
      const rootPath = await workspaceService.setWorkspace(path);
      const tree = await workspaceService.listFiles();
      await workspaceService.rememberWorkspace(rootPath);
      if (get().rootPath && get().rootPath !== rootPath) useTabStore.getState().reset();
      set({ rootPath, tree, activeDocument: null, loading: false });
    } catch (error) {
      set({ loading: false, error: `Çalışma alanı açılamadı: ${errorMessage(error)}` });
    }
  },

  refreshTree: async () => {
    try {
      const tree = await workspaceService.listFiles();
      set({ tree, error: null });
    } catch (error) {
      set({ error: `Dosya ağacı yenilenemedi: ${errorMessage(error)}` });
    }
  },

  openFile: async (path) => {
    set({ loading: true, error: null });
    try {
      const content = await workspaceService.readFile(path);
      useTabStore.getState().open(path, content);
      set({ activeDocument: { path, content }, loading: false });
    } catch (error) {
      set({ loading: false, error: `Dosya açılamadı: ${errorMessage(error)}` });
    }
  },

  clearError: () => set({ error: null }),
  setError: (error) => set({ error }),
}));
