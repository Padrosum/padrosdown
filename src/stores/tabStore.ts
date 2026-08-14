import { create } from "zustand";
import type { DocumentTab, EditorSelection } from "../types/editor";
import { sessionService } from "../services/sessionService";

const emptySelection: EditorSelection = { from: 0, to: 0, text: "" };

interface TabState {
  tabs: DocumentTab[];
  activePath: string | null;
  open: (path: string, content: string) => void;
  setActive: (path: string) => void;
  close: (path: string) => void;
  reorder: (from: number, to: number) => void;
  updateContent: (path: string, content: string) => void;
  updateSelection: (path: string, selection: EditorSelection) => void;
  setSaving: (path: string, saving: boolean) => void;
  markSaved: (path: string, content: string) => void;
  setSaveError: (path: string, error: string | null) => void;
  reset: () => void;
  persist: () => Promise<void>;
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [],
  activePath: null,
  open: (path, content) =>
    set((state) => {
      if (state.tabs.some((tab) => tab.path === path)) return { activePath: path };
      return {
        activePath: path,
        tabs: [
          ...state.tabs,
          {
            path,
            content,
            savedContent: content,
            selection: emptySelection,
            saveError: null,
            saving: false,
          },
        ],
      };
    }),
  setActive: (activePath) => set({ activePath }),
  close: (path) =>
    set((state) => {
      const index = state.tabs.findIndex((tab) => tab.path === path);
      const tabs = state.tabs.filter((tab) => tab.path !== path);
      const activePath =
        state.activePath === path
          ? (tabs[Math.min(index, tabs.length - 1)]?.path ?? null)
          : state.activePath;
      return { tabs, activePath };
    }),
  reorder: (from, to) =>
    set((state) => {
      if (from === to || !state.tabs[from] || !state.tabs[to]) return state;
      const tabs = [...state.tabs];
      const [moved] = tabs.splice(from, 1);
      if (!moved) return state;
      tabs.splice(to, 0, moved);
      return { tabs };
    }),
  updateContent: (path, content) =>
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.path === path ? { ...tab, content, saveError: null } : tab,
      ),
    })),
  updateSelection: (path, selection) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.path === path ? { ...tab, selection } : tab)),
    })),
  setSaving: (path, saving) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.path === path ? { ...tab, saving } : tab)),
    })),
  markSaved: (path, content) =>
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.path === path && tab.content === content
          ? { ...tab, savedContent: content, saving: false, saveError: null }
          : tab.path === path
            ? { ...tab, saving: false }
            : tab,
      ),
    })),
  setSaveError: (path, error) =>
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.path === path ? { ...tab, saving: false, saveError: error } : tab,
      ),
    })),
  reset: () => set({ tabs: [], activePath: null }),
  persist: () =>
    sessionService.save(
      get().tabs.map((tab) => tab.path),
      get().activePath,
    ),
}));
