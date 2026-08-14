import { beforeEach, describe, expect, it, vi } from "vitest";
import { workspaceService } from "../services/workspaceService";
import { useWorkspaceStore } from "./workspaceStore";

vi.mock("../services/workspaceService", () => ({
  workspaceService: {
    chooseWorkspace: vi.fn(),
    setWorkspace: vi.fn(),
    rememberWorkspace: vi.fn(),
    restoreWorkspace: vi.fn(),
    listFiles: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
}));

describe("workspace store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWorkspaceStore.setState({
      rootPath: null,
      tree: [],
      activeDocument: null,
      loading: false,
      error: null,
    });
  });

  it("doğrulanan çalışma alanını ve tek sefer taranan ağacı saklar", async () => {
    vi.mocked(workspaceService.setWorkspace).mockResolvedValue("/notes");
    vi.mocked(workspaceService.listFiles).mockResolvedValue([
      { name: "a.md", path: "a.md", kind: "file", children: [] },
    ]);
    vi.mocked(workspaceService.rememberWorkspace).mockResolvedValue();

    await useWorkspaceStore.getState().openWorkspace("/notes");

    expect(useWorkspaceStore.getState().rootPath).toBe("/notes");
    expect(useWorkspaceStore.getState().tree).toHaveLength(1);
    expect(workspaceService.listFiles).toHaveBeenCalledOnce();
  });

  it("dosya okuma hatasını kullanıcıya görünür hale getirir", async () => {
    vi.mocked(workspaceService.readFile).mockRejectedValue(new Error("erişim reddedildi"));
    await useWorkspaceStore.getState().openFile("a.md");
    expect(useWorkspaceStore.getState().error).toContain("erişim reddedildi");
  });
});
