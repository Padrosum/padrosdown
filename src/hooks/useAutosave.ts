import { useCallback, useEffect } from "react";
import { saveCoordinator } from "../services/saveCoordinator";
import { useTabStore } from "../stores/tabStore";

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useAutosave(path: string | null, delay = 600) {
  const tab = useTabStore((state) => state.tabs.find((item) => item.path === path));
  const setSaving = useTabStore((state) => state.setSaving);
  const markSaved = useTabStore((state) => state.markSaved);
  const setSaveError = useTabStore((state) => state.setSaveError);

  const save = useCallback(async () => {
    if (!tab || tab.content === tab.savedContent) return;
    const content = tab.content;
    setSaving(tab.path, true);
    try {
      await saveCoordinator.enqueue(tab.path, content);
      markSaved(tab.path, content);
    } catch (error) {
      setSaveError(tab.path, `Kaydetme başarısız: ${message(error)}`);
    }
  }, [markSaved, setSaveError, setSaving, tab]);

  useEffect(() => {
    if (!tab || tab.content === tab.savedContent) return;
    const timer = window.setTimeout(() => void save(), delay);
    return () => window.clearTimeout(timer);
  }, [delay, save, tab]);

  return save;
}
