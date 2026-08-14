import { useState } from "react";
import { useSettingsStore } from "../../stores/settingsStore";
import { workspaceService } from "../../services/workspaceService";
import type { AppSettings } from "../../types/settings";

function updateTheme(settings: AppSettings, value: string): AppSettings {
  if (value !== "light" && value !== "dark" && value !== "system") return settings;
  return { ...settings, theme: value };
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const store = useSettingsStore();
  const [draft, setDraft] = useState<AppSettings>(store.settings);
  const [error, setError] = useState<string | null>(null);
  const save = async () => {
    try {
      await workspaceService.setActivityTracking(draft.activityTracking);
      await store.save(draft);
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : JSON.stringify(reason));
    }
  };
  return (
    <div className="modal-backdrop">
      <section
        className="modal settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="modal-title">
          <h2 id="settings-title">Ayarlar</h2>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="settings-grid">
          <label>
            Tema
            <select
              value={draft.theme}
              onChange={(event) => setDraft(updateTheme(draft, event.target.value))}
            >
              <option value="system">Sistem</option>
              <option value="light">Açık</option>
              <option value="dark">Koyu</option>
            </select>
          </label>
          <label>
            Font boyutu
            <input
              type="number"
              min="10"
              max="32"
              value={draft.editorFontSize}
              onChange={(event) =>
                setDraft({ ...draft, editorFontSize: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Font ailesi
            <input
              value={draft.editorFontFamily}
              onChange={(event) => setDraft({ ...draft, editorFontFamily: event.target.value })}
            />
          </label>
          <label>
            Otomatik kaydetme (ms)
            <input
              type="number"
              min="100"
              max="10000"
              value={draft.autosaveDelay}
              onChange={(event) =>
                setDraft({ ...draft, autosaveDelay: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Günlük klasörü
            <input
              value={draft.dailyFolder}
              onChange={(event) => setDraft({ ...draft, dailyFolder: event.target.value })}
            />
          </label>
          <label>
            Inbox klasörü
            <input
              value={draft.inboxFolder}
              onChange={(event) => setDraft({ ...draft, inboxFolder: event.target.value })}
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={draft.lineWrapping}
              onChange={(event) => setDraft({ ...draft, lineWrapping: event.target.checked })}
            />{" "}
            Satır kaydırma
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={draft.restoreSession}
              onChange={(event) => setDraft({ ...draft, restoreSession: event.target.checked })}
            />{" "}
            Son oturumu geri yükle
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={draft.activityTracking}
              onChange={(event) => setDraft({ ...draft, activityTracking: event.target.checked })}
            />{" "}
            Aktivite takibi
          </label>
        </div>
        <details>
          <summary>Klavye kısayolları</summary>
          <div className="settings-grid shortcut-grid">
            {Object.entries(draft.shortcuts).map(([command, shortcut]) => (
              <label key={command}>
                {command}
                <input
                  value={shortcut}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      shortcuts: { ...draft.shortcuts, [command]: event.target.value },
                    })
                  }
                />
              </label>
            ))}
          </div>
        </details>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            İptal
          </button>
          <button className="primary" type="button" onClick={() => void save()}>
            Kaydet
          </button>
        </div>
      </section>
    </div>
  );
}
