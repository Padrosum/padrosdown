import { describe, expect, it, vi } from "vitest";
import { filterCommands, type AppCommand } from "./commands";

describe("komut paleti araması", () => {
  const commands: AppCommand[] = [
    { id: "daily", label: "Bugünün notunu aç", aliases: [":today"], action: vi.fn() },
    { id: "settings", label: "Ayarları aç", action: vi.fn() },
    { id: "summarize", label: "Metni özetle", aliases: [":sum"], action: vi.fn() },
  ];
  it("bulanık eşleşme bulur", () =>
    expect(filterCommands(commands, "bugun not")[0]?.id).toBe("daily"));
  it("başındaki iki noktayı yok sayarak Vim komutunu tam eşleştirir", () => {
    expect(filterCommands(commands, ":sum")[0]?.id).toBe("summarize");
    expect(filterCommands(commands, "today")[0]?.id).toBe("daily");
  });
});
