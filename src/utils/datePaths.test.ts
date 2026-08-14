import { describe, expect, it } from "vitest";
import { dailyNotePath, dailyNoteTemplate, quickNotePath } from "./datePaths";

describe("yerel tarih yolları", () => {
  const date = new Date(2026, 0, 2, 3, 4, 5);
  it("günlük not yolunu oluşturur", () => expect(dailyNotePath(date)).toBe("daily/2026-01-02.md"));
  it("hızlı not yolunu oluşturur", () =>
    expect(quickNotePath(date)).toBe("inbox/2026-01-02-03-04-05.md"));
  it("günlük şablonunda yerel tarihi kullanır", () =>
    expect(dailyNoteTemplate(date)).toContain("Günlük Not — 2026-01-02"));
});
