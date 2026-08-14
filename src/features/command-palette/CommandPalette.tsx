import { useMemo, useState } from "react";
import { filterCommands, type AppCommand } from "./commands";

export function CommandPalette({
  commands,
  onClose,
}: {
  commands: AppCommand[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => filterCommands(commands, query), [commands, query]);
  return (
    <div
      className="modal-backdrop palette-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Komut paleti"
      >
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder=":komut veya işlem ara…"
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
            if (event.key === "Enter" && results[0]) {
              results[0].action();
              onClose();
            }
          }}
        />
        <ul>
          {results.map((command) => (
            <li key={command.id}>
              <button
                type="button"
                onClick={() => {
                  command.action();
                  onClose();
                }}
              >
                <span className="command-name">
                  {command.aliases?.[0] ? <kbd>{command.aliases[0]}</kbd> : null}
                  <span>{command.label}</span>
                </span>
                <kbd>{command.shortcut}</kbd>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
