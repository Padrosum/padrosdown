function parts(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`,
  };
}

export function dailyNotePath(date: Date, folder = "daily"): string {
  return `${folder}/${parts(date).date}.md`;
}

export function quickNotePath(date: Date, folder = "inbox"): string {
  const value = parts(date);
  return `${folder}/${value.date}-${value.time}.md`;
}

export function dailyNoteTemplate(date: Date): string {
  const value = parts(date).date;
  return `# Günlük Not — ${value}\n\n## Bugün\n\n## Üzerinde çalıştıklarım\n\n## Aklıma gelenler\n\n## Daha sonra\n`;
}
