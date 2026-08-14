import { useEffect, useState } from "react";
import { workspaceService } from "../../services/workspaceService";
import type { ActivitySummary } from "../../types/search";
import { errorText } from "../../utils/errors";

interface HomeDashboardProps {
  workspaceOpen: boolean;
  workspaceName: string | null;
  onOpen: (path: string) => void;
  onOpenWorkspace: () => void;
  onDaily: () => void;
  onNewFile: () => void;
  onQuick: () => void;
  onActivity: () => void;
}

function greeting(hour: number): string {
  if (hour < 6) return "İyi geceler";
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}

export function HomeDashboard({
  workspaceOpen,
  workspaceName,
  onOpen,
  onOpenWorkspace,
  onDaily,
  onNewFile,
  onQuick,
  onActivity,
}: HomeDashboardProps) {
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  useEffect(() => {
    if (!workspaceOpen) {
      setSummary(null);
      return;
    }
    setLoading(true);
    setError(null);
    void workspaceService
      .activitySummary()
      .then(setSummary)
      .catch((reason: unknown) => setError(errorText(reason)))
      .finally(() => setLoading(false));
  }, [workspaceOpen]);

  return (
    <div className="home-dashboard">
      <header className="home-hero">
        <span className="home-date">{formattedDate}</span>
        <h1>{greeting(now.getHours())}.</h1>
        <p>
          {workspaceOpen
            ? `${workspaceName ?? "Çalışma alanınız"} içinde kaldığınız yerden devam edin.`
            : "Notlarınızı açık Markdown dosyaları olarak kendi klasörünüzde tutun."}
        </p>
        <div className="home-actions">
          {workspaceOpen ? (
            <>
              <button className="home-primary-action" type="button" onClick={onDaily}>
                <span aria-hidden="true">→</span>
                <span>
                  <strong>Bugünün notuna devam et</strong>
                  <small>Ctrl+Shift+D</small>
                </span>
              </button>
              <button type="button" onClick={onNewFile}>
                Yeni dosya
              </button>
              <button type="button" onClick={onQuick}>
                Hızlı not
              </button>
            </>
          ) : (
            <button className="home-primary-action" type="button" onClick={onOpenWorkspace}>
              <span aria-hidden="true">→</span>
              <span>
                <strong>Çalışma alanı aç</strong>
                <small>Markdown klasörünüzü seçin</small>
              </span>
            </button>
          )}
        </div>
      </header>

      {workspaceOpen ? (
        <section className="home-overview" aria-labelledby="week-title">
          <div className="home-section-heading">
            <div>
              <span className="eyebrow">ÇALIŞMA RİTMİ</span>
              <h2 id="week-title">Son 7 Gün</h2>
            </div>
            <button type="button" onClick={onActivity}>
              Ayrıntıları göster
            </button>
          </div>
          {error ? <p className="error-text">Aktivite yüklenemedi: {error}</p> : null}
          {loading ? <p className="home-loading">Aktivite yükleniyor…</p> : null}
          {summary && !loading ? (
            <>
              <div className="home-stats" aria-label="Son yedi gün özeti">
                <div>
                  <strong>{summary.createdFiles}</strong>
                  <span>yeni dosya</span>
                </div>
                <div>
                  <strong>{summary.editedFiles}</strong>
                  <span>düzenlenen</span>
                </div>
                <div>
                  <strong>{summary.totalWordsAdded}</strong>
                  <span>eklenen kelime</span>
                </div>
              </div>
              <div className="home-recent-section">
                <h3>Son çalışılanlar</h3>
                {summary.recentFiles.length ? (
                  <div className="home-recents">
                    {summary.recentFiles.slice(0, 5).map((path) => (
                      <button type="button" key={path} onClick={() => onOpen(path)} title={path}>
                        <span>{path.split("/").pop()}</span>
                        <small>{path}</small>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="home-empty">Henüz kaydedilmiş bir çalışma yok.</p>
                )}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      <footer className="home-command-hint">
        <kbd>Esc</kbd>
        <span>ardından</span>
        <kbd>:</kbd>
        <span>ile komut paletini açın</span>
      </footer>
    </div>
  );
}
