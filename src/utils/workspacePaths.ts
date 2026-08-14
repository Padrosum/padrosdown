export function pathName(path: string): string {
  return path.split("/").filter(Boolean).at(-1) ?? path;
}

export function pathDirectory(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts.slice(0, -1).join("/");
}

export function joinWorkspacePath(...parts: string[]): string {
  return parts
    .flatMap((part) => part.split("/"))
    .filter((part) => part && part !== ".")
    .join("/");
}
