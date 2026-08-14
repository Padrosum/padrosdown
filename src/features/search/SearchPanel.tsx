import { useEffect, useState } from "react";
import { workspaceService } from "../../services/workspaceService";
import type { SearchResult } from "../../types/search";

export function SearchPanel({
  onClose,
  onOpen,
}: {
  onClose: () => void;
  onOpen: (result: SearchResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      setSearching(true);
      setError(null);
      void workspaceService
        .search(query)
        .then(setResults)
        .catch((reason: unknown) =>
          setError(reason instanceof Error ? reason.message : JSON.stringify(reason)),
        )
        .finally(() => setSearching(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  return (
    <div className="modal-backdrop palette-backdrop" role="presentation">
      <section
        className="search-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Çalışma alanında ara"
      >
        <div className="search-input-row">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Dosya adı ve Markdown içeriğinde ara…"
            onKeyDown={(event) => {
              if (event.key === "Escape") onClose();
            }}
          />
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="search-status">
          {searching ? "Aranıyor…" : (error ?? `${results.length} sonuç`)}
        </div>
        <ul>
          {results.map((result) => (
            <li key={result.path}>
              <button type="button" onClick={() => onOpen(result)}>
                <strong>{result.fileName}</strong>
                <span>
                  {result.path} · satır {result.line} · {result.matchCount} eşleşme
                </span>
                <small>{result.snippet}</small>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
