import { beforeEach, describe, expect, it } from "vitest";
import { useTabStore } from "./tabStore";

describe("tab store", () => {
  beforeEach(() => useTabStore.getState().reset());

  it("aynı dosya için ikinci sekme oluşturmaz", () => {
    useTabStore.getState().open("notes/a.md", "ilk");
    useTabStore.getState().open("notes/a.md", "ikinci");
    expect(useTabStore.getState().tabs).toHaveLength(1);
    expect(useTabStore.getState().activePath).toBe("notes/a.md");
  });

  it("sekme kapandığında komşu sekmeyi etkinleştirir ve sıralamayı değiştirir", () => {
    useTabStore.getState().open("a.md", "a");
    useTabStore.getState().open("b.md", "b");
    useTabStore.getState().reorder(1, 0);
    expect(useTabStore.getState().tabs.map((tab) => tab.path)).toEqual(["b.md", "a.md"]);
    useTabStore.getState().close("b.md");
    expect(useTabStore.getState().activePath).toBe("a.md");
  });
});
