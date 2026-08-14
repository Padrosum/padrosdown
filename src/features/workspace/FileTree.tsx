import { useState } from "react";
import type { FileNode } from "../../types/workspace";

interface FileTreeProps {
  nodes: FileNode[];
  activePath: string | null;
  onOpenFile: (path: string) => void;
  onRename: (node: FileNode) => void;
  onDelete: (node: FileNode) => void;
  onMove: (source: string, destinationFolder: string) => void;
}

function TreeItem({
  node,
  activePath,
  onOpenFile,
  onRename,
  onDelete,
  onMove,
}: FileTreeProps & { node: FileNode }) {
  const [expanded, setExpanded] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const isDirectory = node.kind === "directory";

  return (
    <li>
      <button
        className={`tree-item ${activePath === node.path ? "is-active" : ""}`}
        type="button"
        onClick={() => (isDirectory ? setExpanded((value) => !value) : onOpenFile(node.path))}
        onContextMenu={(event) => {
          event.preventDefault();
          setMenu({ x: event.clientX, y: event.clientY });
        }}
        draggable
        onDragStart={(event) => event.dataTransfer.setData("text/workspace-path", node.path)}
        onDragOver={(event) => {
          if (isDirectory) event.preventDefault();
        }}
        onDrop={(event) => {
          if (!isDirectory) return;
          event.preventDefault();
          const source = event.dataTransfer.getData("text/workspace-path");
          if (source && source !== node.path) onMove(source, node.path);
        }}
        aria-expanded={isDirectory ? expanded : undefined}
      >
        <span aria-hidden="true">{isDirectory ? (expanded ? "▾" : "▸") : "·"}</span>
        <span>{node.name}</span>
      </button>
      {menu ? (
        <div
          className="context-menu"
          style={{ left: menu.x, top: menu.y }}
          onMouseLeave={() => setMenu(null)}
        >
          {!isDirectory ? (
            <button
              type="button"
              onClick={() => {
                onOpenFile(node.path);
                setMenu(null);
              }}
            >
              Aç
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              onRename(node);
              setMenu(null);
            }}
          >
            Yeniden adlandır
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete(node);
              setMenu(null);
            }}
          >
            Çöp kutusuna taşı
          </button>
        </div>
      ) : null}
      {isDirectory && expanded && node.children.length > 0 ? (
        <ul className="tree-list nested">
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              nodes={[]}
              activePath={activePath}
              onOpenFile={onOpenFile}
              onRename={onRename}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function FileTree({
  nodes,
  activePath,
  onOpenFile,
  onRename,
  onDelete,
  onMove,
}: FileTreeProps) {
  if (nodes.length === 0) return <p className="empty-state">Markdown dosyası bulunamadı.</p>;

  return (
    <ul className="tree-list">
      {nodes.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          nodes={[]}
          activePath={activePath}
          onOpenFile={onOpenFile}
          onRename={onRename}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </ul>
  );
}
