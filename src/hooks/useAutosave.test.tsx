import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveCoordinator } from "../services/saveCoordinator";
import { useTabStore } from "../stores/tabStore";
import { useAutosave } from "./useAutosave";

describe("otomatik kaydetme debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useTabStore.getState().reset();
    useTabStore.getState().open("a.md", "eski");
  });
  it("600 ms dolmadan yazmaz", async () => {
    const enqueue = vi.spyOn(saveCoordinator, "enqueue").mockResolvedValue();
    renderHook(() => useAutosave("a.md", 600));
    act(() => useTabStore.getState().updateContent("a.md", "yeni"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(599);
    });
    expect(enqueue).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(enqueue).toHaveBeenCalledWith("a.md", "yeni");
    vi.useRealTimers();
  });
});
