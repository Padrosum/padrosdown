export function shortcutFromEvent(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.ctrlKey) parts.push("ctrl");
  if (event.altKey) parts.push("alt");
  if (event.shiftKey) parts.push("shift");
  if (event.metaKey) parts.push("meta");
  const key = event.key === " " ? "space" : event.key.toLowerCase();
  if (!["control", "alt", "shift", "meta"].includes(key)) parts.push(key);
  return parts.join("+");
}

export function matchesShortcut(event: KeyboardEvent, shortcut: string | undefined): boolean {
  return (
    Boolean(shortcut) && shortcutFromEvent(event) === shortcut?.toLowerCase().replaceAll(" ", "")
  );
}
