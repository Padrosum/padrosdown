import { load } from "@tauri-apps/plugin-store";

const STORE_PATH = "session.json";

interface SessionData {
  paths: string[];
  activePath: string | null;
}

function isSessionData(value: unknown): value is SessionData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    Array.isArray(candidate.paths) &&
    candidate.paths.every((path) => typeof path === "string") &&
    (typeof candidate.activePath === "string" || candidate.activePath === null)
  );
}

export const sessionService = {
  async save(paths: string[], activePath: string | null): Promise<void> {
    const store = await load(STORE_PATH, { autoSave: false, defaults: {} });
    await store.set("tabs", { paths, activePath });
    await store.save();
  },

  async restore(): Promise<SessionData> {
    const store = await load(STORE_PATH, { autoSave: false, defaults: {} });
    const value = await store.get<unknown>("tabs");
    return isSessionData(value) ? value : { paths: [], activePath: null };
  },
};
