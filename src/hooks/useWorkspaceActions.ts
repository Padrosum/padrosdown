import { workspaceService } from "../services/workspaceService";
import type { AppSettings } from "../types/settings";
import type { FileNode } from "../types/workspace";
import { dailyNotePath, dailyNoteTemplate, quickNotePath } from "../utils/datePaths";
import { errorText } from "../utils/errors";
import { joinWorkspacePath, pathDirectory, pathName } from "../utils/workspacePaths";
import { useTabStore } from "../stores/tabStore";
import { useWorkspaceStore } from "../stores/workspaceStore";

export function useWorkspaceActions(settings: AppSettings, closeQuickCapture: () => void) {
  const workspace = useWorkspaceStore();
  const tabs = useTabStore();
  const run = async (action: () => Promise<void>) => {
    if (!workspace.rootPath) {
      workspace.setError("Önce bir çalışma alanı seçin.");
      return;
    }
    try {
      await action();
      await workspace.refreshTree();
    } catch (error) {
      workspace.setError(errorText(error));
    }
  };
  const createFile = async () => {
    const input = window.prompt("Yeni Markdown dosyasının göreli yolu:", "yeni-not.md");
    if (!input) return;
    const path = /\.markdown?$/i.test(input) ? input : `${input}.md`;
    await run(async () => {
      await workspaceService.createFile(path);
      await workspace.openFile(path);
    });
  };
  const createFolder = async () => {
    const path = window.prompt("Yeni klasörün göreli yolu:", "yeni-klasor");
    if (path) await run(() => workspaceService.createFolder(path));
  };
  const ensureFolder = async (folder: string) => {
    try {
      await workspaceService.createFolder(folder);
    } catch {
      /* Var olan klasör kullanılır. */
    }
  };
  const openDaily = async () => {
    if (!workspace.rootPath) {
      workspace.setError("Önce bir çalışma alanı seçin.");
      return;
    }
    const date = new Date();
    const path = dailyNotePath(date, settings.dailyFolder);
    try {
      tabs.open(path, await workspaceService.readFile(path));
    } catch {
      try {
        await ensureFolder(settings.dailyFolder);
        await workspaceService.createFile(path, dailyNoteTemplate(date));
        await workspace.refreshTree();
        await workspace.openFile(path);
      } catch (error) {
        workspace.setError(errorText(error));
      }
    }
  };
  const saveQuick = async (content: string, openAfter: boolean) => {
    try {
      const date = new Date();
      const path = quickNotePath(date, settings.inboxFolder);
      await ensureFolder(settings.inboxFolder);
      await workspaceService.createFile(
        path,
        `---\ncreated: ${date.toISOString()}\n---\n\n${content.trim()}\n`,
      );
      await workspace.refreshTree();
      closeQuickCapture();
      if (openAfter) await workspace.openFile(path);
    } catch (error) {
      workspace.setError(errorText(error));
    }
  };
  const renameNode = async (node: FileNode) => {
    const name = window.prompt("Yeni ad:", node.name);
    if (name && name !== node.name)
      await run(() =>
        workspaceService.moveEntry(node.path, joinWorkspacePath(pathDirectory(node.path), name)),
      );
  };
  const deleteNode = async (node: FileNode) => {
    if (!window.confirm(`“${node.name}” sistem çöp kutusuna taşınsın mı?`)) return;
    await run(async () => {
      await workspaceService.trashEntry(node.path);
      tabs.close(node.path);
    });
  };
  const moveNode = (source: string, folder: string) =>
    run(() => workspaceService.moveEntry(source, joinWorkspacePath(folder, pathName(source))));
  return { createFile, createFolder, openDaily, saveQuick, renameNode, deleteNode, moveNode };
}
