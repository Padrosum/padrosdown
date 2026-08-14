import { useEffect, useState } from "react";
import { workspaceService } from "../../services/workspaceService";
import type { ActivitySummary } from "../../types/search";

export function ActivityDashboard({
  onClose,
  onOpen,
}: {
  onClose: () => void;
  onOpen: (path: string) => void;
}) {
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void workspaceService
      .activitySummary()
      .then(setSummary)
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : JSON.stringify(reason)),
      );
  }, []);
  return (
    <div className="modal-backdrop">
      <section
        className="modal activity-dashboard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-title"
      >
        <div className="modal-title">
          <h2 id="activity-title">Son 7 Gün</h2>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        {error ? (
          <p className="error-text">{error}</p>
        ) : !summary ? (
          <p>Yükleniyor…</p>
        ) : (
          <>
            <div className="stats-grid">
              <div>
                <strong>{summary.createdFiles}</strong>
                <span>Oluşturulan dosya</span>
              </div>
              <div>
                <strong>{summary.editedFiles}</strong>
                <span>Düzenlenen dosya</span>
              </div>
              <div>
                <strong>{summary.totalWordsAdded}</strong>
                <span>Eklenen kelime</span>
              </div>
            </div>
            <div className="activity-columns">
              <section>
                <h3>Son düzenlenenler</h3>
                {summary.recentFiles.map((path) => (
                  <button type="button" key={path} onClick={() => onOpen(path)}>
                    {path}
                  </button>
                ))}
              </section>
              <section>
                <h3>En çok düzenlenenler</h3>
                {summary.mostEdited.map((item) => (
                  <button type="button" key={item.path} onClick={() => onOpen(item.path)}>
                    {item.path} <span>{item.edits}</span>
                  </button>
                ))}
              </section>
            </div>
            <h3>Çalışma dağılımı</h3>
            <div className="day-bars">
              {summary.days.map((day) => (
                <div
                  key={day.day}
                  title={`${day.edits} oturum, ${day.wordsAdded} kelime`}
                  style={{ height: `${Math.max(8, Math.min(100, day.edits * 14))}%` }}
                >
                  <span>{day.edits}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
