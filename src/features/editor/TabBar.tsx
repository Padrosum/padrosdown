import type { DocumentTab } from "../../types/editor";

interface TabBarProps {
  tabs: DocumentTab[];
  activePath: string | null;
  onActivate: (path: string) => void;
  onClose: (path: string) => void;
  onReorder: (from: number, to: number) => void;
}

export function TabBar({ tabs, activePath, onActivate, onClose, onReorder }: TabBarProps) {
  return (
    <div className="tabbar" role="tablist">
      {tabs.map((tab, index) => (
        <div
          key={tab.path}
          className={`tab ${activePath === tab.path ? "is-active" : ""}`}
          role="tab"
          aria-selected={activePath === tab.path}
          draggable
          onDragStart={(event) => event.dataTransfer.setData("text/tab-index", String(index))}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const from = Number(event.dataTransfer.getData("text/tab-index"));
            if (Number.isInteger(from)) onReorder(from, index);
          }}
        >
          <button
            type="button"
            className="tab-title"
            onClick={() => onActivate(tab.path)}
            title={tab.path}
          >
            {tab.content !== tab.savedContent ? <span className="dirty-mark">●</span> : null}
            {tab.path.split("/").pop()}
          </button>
          <button
            type="button"
            className="tab-close"
            onClick={() => onClose(tab.path)}
            aria-label={`${tab.path} sekmesini kapat`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
