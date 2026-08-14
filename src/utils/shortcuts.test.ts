import { describe, expect, it } from "vitest";
import { matchesShortcut } from "./shortcuts";
describe("klavye kısayolları", () => {
  it("değiştirilebilir kısayolu eşleştirir", () => {
    const event = new KeyboardEvent("keydown", { key: "K", ctrlKey: true });
    expect(matchesShortcut(event, "Ctrl+K")).toBe(true);
    expect(matchesShortcut(event, "Ctrl+P")).toBe(false);
  });
});
