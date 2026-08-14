import { load } from "@tauri-apps/plugin-store";
import { defaultSettings, type AppSettings } from "../types/settings";

export const settingsService = {
  async load(): Promise<AppSettings> {
    const store = await load("settings.json", { autoSave: false, defaults: {} });
    const saved = await store.get<Partial<AppSettings>>("appSettings");
    const settings: AppSettings = {
      theme: saved?.theme ?? defaultSettings.theme,
      editorFontSize: saved?.editorFontSize ?? defaultSettings.editorFontSize,
      editorFontFamily: saved?.editorFontFamily ?? defaultSettings.editorFontFamily,
      lineWrapping: saved?.lineWrapping ?? defaultSettings.lineWrapping,
      autosaveDelay: saved?.autosaveDelay ?? defaultSettings.autosaveDelay,
      dailyFolder: saved?.dailyFolder ?? defaultSettings.dailyFolder,
      inboxFolder: saved?.inboxFolder ?? defaultSettings.inboxFolder,
      restoreSession: saved?.restoreSession ?? defaultSettings.restoreSession,
      activityTracking: saved?.activityTracking ?? defaultSettings.activityTracking,
      shortcuts: { ...defaultSettings.shortcuts, ...saved?.shortcuts },
    };
    await store.set("appSettings", settings);
    await store.save();
    return settings;
  },
  async save(settings: AppSettings): Promise<void> {
    const store = await load("settings.json", { autoSave: false, defaults: {} });
    await store.set("appSettings", settings);
    await store.save();
  },
};
