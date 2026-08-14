import { create } from "zustand";
import { settingsService } from "../services/settingsService";
import { defaultSettings, type AppSettings } from "../types/settings";

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  load: () => Promise<void>;
  save: (settings: AppSettings) => Promise<void>;
}
export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  loaded: false,
  load: async () => {
    const settings = await settingsService.load();
    set({ settings, loaded: true });
  },
  save: async (settings) => {
    await settingsService.save(settings);
    set({ settings });
  },
}));
