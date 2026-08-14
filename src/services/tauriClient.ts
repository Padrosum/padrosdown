import { invoke } from "@tauri-apps/api/core";

export const tauriClient = {
  invoke<TResult>(command: string, args?: Record<string, unknown>): Promise<TResult> {
    return invoke<TResult>(command, args);
  },
};
