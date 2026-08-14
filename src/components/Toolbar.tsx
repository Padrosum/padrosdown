interface ToolbarProps {
  loading: boolean;
  filesOpen: boolean;
  documentName: string | null;
  documentState: string;
  onToggleFiles: () => void;
  onNewFile: () => void;
  onDaily: () => void;
  onQuick: () => void;
  onSearch: () => void;
  onPalette: () => void;
  onSettings: () => void;
  onToggleTheme: () => void;
}

export function Toolbar(props: ToolbarProps) {
  return (
    <header className="zen-toolbar">
      <div className="toolbar-leading">
        <strong className="brand" aria-label="padrosdown ana ekranı">
          <span className="brand-mark" aria-hidden="true">
            p
          </span>
          <span>padrosdown</span>
        </strong>
        <button
          className={`toolbar-action ${props.filesOpen ? "is-active" : ""}`}
          type="button"
          onClick={props.onToggleFiles}
          disabled={props.loading}
          aria-expanded={props.filesOpen}
          aria-controls="workspace-drawer"
        >
          <span aria-hidden="true">☰</span>
          Dosyalar
        </button>
      </div>

      <div className="document-indicator" title={props.documentName ?? undefined}>
        <strong>{props.documentName ?? "Yeni bir düşünceye yer aç"}</strong>
        <span>{props.documentState}</span>
      </div>

      <nav className="toolbar-actions" aria-label="Yazma araçları">
        <button className="toolbar-action" type="button" onClick={props.onNewFile}>
          <span aria-hidden="true">＋</span>
          Yeni dosya
        </button>
        <button className="toolbar-action" type="button" onClick={props.onDaily}>
          Günlük not
        </button>
        <button className="toolbar-action" type="button" onClick={props.onQuick}>
          Hızlı not
        </button>
        <button className="toolbar-action" type="button" onClick={props.onSearch}>
          Arama
        </button>
        <button className="toolbar-action" type="button" onClick={props.onPalette}>
          Komut paleti
        </button>
        <button className="toolbar-action" type="button" onClick={props.onSettings}>
          Ayarlar
        </button>
        <button
          className="icon-action"
          type="button"
          onClick={props.onToggleTheme}
          aria-label="Temayı değiştir"
          title="Temayı değiştir"
        >
          ◐
        </button>
      </nav>
    </header>
  );
}
