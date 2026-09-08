import { create } from "zustand";
import type { AppSettings } from "../types";
import { getSettings, saveSettings } from "../db/db";

interface SettingsState {
  settings: AppSettings | null;
  loaded: boolean;
  load: () => Promise<void>;
  update: (patch: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loaded: false,
  load: async () => {
    const settings = await getSettings();
    set({ settings, loaded: true });
  },
  update: async (patch) => {
    const current = get().settings;
    if (!current) return;
    const next = { ...current, ...patch };
    await saveSettings(next);
    set({ settings: next });
  },
}));
