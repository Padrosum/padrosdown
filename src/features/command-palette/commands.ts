import Fuse from "fuse.js";

export interface AppCommand {
  id: string;
  label: string;
  aliases?: string[];
  shortcut?: string;
  action: () => void;
}

export function filterCommands(commands: AppCommand[], query: string): AppCommand[] {
  const normalized = query.trim().replace(/^:/, "").toLocaleLowerCase("tr");
  if (!normalized) return commands;
  const exact = commands.find((command) =>
    [command.id, ...(command.aliases ?? [])]
      .map((value) => value.replace(/^:/, "").toLocaleLowerCase("tr"))
      .includes(normalized),
  );
  const fuzzy = new Fuse(commands, {
    keys: ["label", "id", "aliases"],
    threshold: 0.35,
  })
    .search(normalized)
    .map((result) => result.item);
  return exact ? [exact, ...fuzzy.filter((command) => command.id !== exact.id)] : fuzzy;
}
