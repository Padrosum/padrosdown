import { describe, expect, it, vi } from "vitest";
import { SaveCoordinator } from "./saveCoordinator";

describe("save coordinator", () => {
  it("aynı dosyanın yazmalarını çağrı sırasıyla tamamlar", async () => {
    let releaseFirst: (() => void) | undefined;
    const calls: string[] = [];
    const writer = vi.fn(async (_path: string, content: string) => {
      calls.push(`start:${content}`);
      if (content === "first")
        await new Promise<void>((resolve) => {
          releaseFirst = resolve;
        });
      calls.push(`end:${content}`);
    });
    const coordinator = new SaveCoordinator(writer);
    const first = coordinator.enqueue("a.md", "first");
    const second = coordinator.enqueue("a.md", "second");
    await vi.waitFor(() => expect(releaseFirst).toBeTypeOf("function"));
    expect(calls).toEqual(["start:first"]);
    releaseFirst?.();
    await Promise.all([first, second]);
    expect(calls).toEqual(["start:first", "end:first", "start:second", "end:second"]);
  });
});
