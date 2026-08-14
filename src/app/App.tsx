import { useEffect, useRef, useState } from "react";
import { Toolbar } from "../components/Toolbar";
import { ActivityDashboard } from "../features/activity/ActivityDashboard";
import { HomeDashboard } from "../features/activity/HomeDashboard";
import { CommandPalette } from "../features/command-palette/CommandPalette";
import type { AppCommand } from "../features/command-palette/commands";
import { MarkdownEditor } from "../features/editor/MarkdownEditor";
import { TabBar } from "../features/editor/TabBar";
import { QuickCapture } from "../features/quick-capture/QuickCapture";
import { SearchPanel } from "../features/search/SearchPanel";
import { SettingsModal } from "../features/settings/SettingsModal";
import { FileTree } from "../features/workspace/FileTree";
import { useAutosave } from "../hooks/useAutosave";
import { useResizablePanels } from "../hooks/useResizablePanels";
import { useWorkspaceActions } from "../hooks/useWorkspaceActions";
import { sessionService } from "../services/sessionService";
import { workspaceService } from "../services/workspaceService";
import { useSettingsStore } from "../stores/settingsStore";
import { useTabStore } from "../stores/tabStore";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { matchesShortcut } from "../utils/shortcuts";

type Theme = "light" | "dark";

export function App() {
  const workspace = useWorkspaceStore();
  const tabs = useTabStore();
  const settingsStore = useSettingsStore();
  const panels = useResizablePanels();
  const activeTab = tabs.tabs.find((tab) => tab.path === tabs.activePath) ?? null;
  const saveNow = useAutosave(tabs.activePath, settingsStore.settings.autosaveDelay);
  const restoredRoot = useRef<string | null>(null);
  const vimCommandArmed = useRef(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [jumpTarget, setJumpTarget] = useState<{ path: string; line: number } | null>(null);
  const [theme, setTheme] = useState<Theme>(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );
  const { createFile, createFolder, openDaily, saveQuick, renameNode, deleteNode, moveNode } =
    useWorkspaceActions(settingsStore.settings, () => setQuickOpen(false));

  useEffect(() => void useWorkspaceStore.getState().initialize(), []);
  useEffect(() => void useSettingsStore.getState().load(), []);
  useEffect(() => {
    if (settingsStore.loaded)
      void workspaceService.setActivityTracking(settingsStore.settings.activityTracking);
  }, [settingsStore.loaded, settingsStore.settings.activityTracking]);
  useEffect(() => {
    const configured = settingsStore.settings.theme;
    setTheme(
      configured === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : configured,
    );
  }, [settingsStore.settings.theme]);

  useEffect(() => {
    if (!workspace.rootPath || !settingsStore.loaded || restoredRoot.current === workspace.rootPath)
      return;
    restoredRoot.current = workspace.rootPath;
    if (!settingsStore.settings.restoreSession) {
      useTabStore.getState().reset();
      return;
    }
    void (async () => {
      const session = await sessionService.restore();
      for (const path of session.paths) {
        try {
          const content = await workspaceService.readFile(path);
          useTabStore.getState().open(path, content);
        } catch {
          // Oturum dışında silinen dosya güvenle atlanır.
        }
      }
      if (
        session.activePath &&
        useTabStore.getState().tabs.some((tab) => tab.path === session.activePath)
      ) {
        useTabStore.getState().setActive(session.activePath);
      }
    })();
  }, [settingsStore.loaded, settingsStore.settings.restoreSession, workspace.rootPath]);

  useEffect(() => {
    const persist = () => void useTabStore.getState().persist();
    window.addEventListener("beforeunload", persist);
    return () => window.removeEventListener("beforeunload", persist);
  }, []);

  useEffect(() => {
    const closeDrawers = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      vimCommandArmed.current = true;
      setFilesOpen(false);
    };
    window.addEventListener("keydown", closeDrawers);
    return () => window.removeEventListener("keydown", closeDrawers);
  }, []);

  const closeTab = (path: string) => {
    const tab = tabs.tabs.find((item) => item.path === path);
    if (
      tab &&
      tab.content !== tab.savedContent &&
      !window.confirm("Kaydedilmemiş değişiklikler var. Sekme kapatılsın mı?")
    )
      return;
    tabs.close(path);
    void useTabStore.getState().persist();
  };

  const commands: AppCommand[] = [
    {
      id: "save",
      label: "Aktif dosyayı kaydet",
      aliases: [":w"],
      shortcut: "Ctrl+S",
      action: () => void saveNow(),
    },
    {
      id: "close",
      label: "Aktif sekmeyi kapat",
      aliases: [":q"],
      shortcut: "Ctrl+W",
      action: () => {
        if (tabs.activePath) closeTab(tabs.activePath);
      },
    },
    {
      id: "save-close",
      label: "Kaydet ve aktif sekmeyi kapat",
      aliases: [":wq"],
      action: () => {
        void saveNow().then(() => {
          const state = useTabStore.getState();
          const tab = state.tabs.find((item) => item.path === state.activePath);
          if (tab && tab.content === tab.savedContent) state.close(tab.path);
        });
      },
    },
    {
      id: "file-search",
      label: "Dosya ara",
      aliases: [":find"],
      shortcut: "Ctrl+P",
      action: () => setSearchOpen(true),
    },
    {
      id: "new-file",
      label: "Yeni dosya oluştur",
      aliases: [":new"],
      shortcut: "Ctrl+N",
      action: () => void createFile(),
    },
    {
      id: "new-folder",
      label: "Yeni klasör oluştur",
      aliases: [":mkdir"],
      action: () => void createFolder(),
    },
    {
      id: "daily",
      label: "Bugünün notunu aç",
      aliases: [":today"],
      shortcut: "Ctrl+Shift+D",
      action: () => void openDaily(),
    },
    {
      id: "quick",
      label: "Hızlı not aç",
      aliases: [":note"],
      shortcut: "Ctrl+Shift+N",
      action: () => setQuickOpen(true),
    },
    {
      id: "recent",
      label: "Son düzenlenen dosyaları göster",
      aliases: [":recent"],
      action: () => setActivityOpen(true),
    },
    {
      id: "weekly-review",
      label: "Son 7 gün ayrıntılarını göster",
      aliases: [":week"],
      action: () => setActivityOpen(true),
    },
    {
      id: "theme",
      label: "Temayı değiştir",
      aliases: [":theme"],
      action: () => setTheme((current) => (current === "light" ? "dark" : "light")),
    },
    {
      id: "settings",
      label: "Ayarları aç",
      aliases: [":set"],
      shortcut: "Ctrl+,",
      action: () => setSettingsOpen(true),
    },
    {
      id: "workspace",
      label: "Çalışma alanını değiştir",
      aliases: [":e"],
      shortcut: "Ctrl+O",
      action: () => void workspace.chooseWorkspace(),
    },
  ];

  const actionsRef = useRef({ createFile, openDaily });
  actionsRef.current = { createFile, openDaily };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isTextEntry =
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      const hasModal = Boolean(
        quickOpen || paletteOpen || searchOpen || activityOpen || settingsOpen,
      );
      if (
        event.key === ":" &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        (!isTextEntry || vimCommandArmed.current) &&
        !hasModal
      ) {
        event.preventDefault();
        vimCommandArmed.current = false;
        setPaletteOpen(true);
        return;
      }
      if (
        vimCommandArmed.current &&
        event.key !== "Escape" &&
        !["Control", "Alt", "Meta", "Shift"].includes(event.key)
      ) {
        vimCommandArmed.current = false;
      }
      const shortcuts = useSettingsStore.getState().settings.shortcuts;
      if (matchesShortcut(event, shortcuts.save)) {
        event.preventDefault();
        void saveNow();
      }
      if (matchesShortcut(event, shortcuts.closeTab)) {
        event.preventDefault();
        const state = useTabStore.getState();
        if (state.activePath) state.close(state.activePath);
      }
      if (matchesShortcut(event, shortcuts.commandPalette)) {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (matchesShortcut(event, shortcuts.fileSearch)) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (matchesShortcut(event, shortcuts.workspaceSearch)) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (matchesShortcut(event, shortcuts.settings)) {
        event.preventDefault();
        setSettingsOpen(true);
      }
      if (matchesShortcut(event, shortcuts.quickCapture)) {
        event.preventDefault();
        setQuickOpen(true);
      } else if (matchesShortcut(event, shortcuts.newFile)) {
        event.preventDefault();
        void actionsRef.current.createFile();
      }
      if (matchesShortcut(event, shortcuts.dailyNote)) {
        event.preventDefault();
        void actionsRef.current.openDaily();
      }
      if (matchesShortcut(event, shortcuts.openWorkspace)) {
        event.preventDefault();
        void useWorkspaceStore.getState().chooseWorkspace();
      }
      if (
        matchesShortcut(event, shortcuts.nextTab) ||
        matchesShortcut(event, shortcuts.previousTab)
      ) {
        event.preventDefault();
        const state = useTabStore.getState();
        if (!state.tabs.length) return;
        const current = state.tabs.findIndex((tab) => tab.path === state.activePath);
        const direction = matchesShortcut(event, shortcuts.previousTab) ? -1 : 1;
        const next = (current + direction + state.tabs.length) % state.tabs.length;
        const path = state.tabs[next]?.path;
        if (path) state.setActive(path);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activityOpen, paletteOpen, quickOpen, saveNow, searchOpen, settingsOpen]);

  return (
    <main className="app" data-theme={theme}>
      <Toolbar
        loading={workspace.loading}
        filesOpen={filesOpen}
        documentName={activeTab?.path.split("/").pop() ?? null}
        documentState={
          activeTab?.saving
            ? "Kaydediliyor…"
            : activeTab && activeTab.content !== activeTab.savedContent
              ? "Kaydedilmemiş değişiklik"
              : activeTab
                ? "Kaydedildi"
                : workspace.rootPath
                  ? "Çalışma alanı hazır"
                  : "Çalışma alanı seçin"
        }
        onToggleFiles={() => setFilesOpen((open) => !open)}
        onNewFile={() => void createFile()}
        onDaily={() => void openDaily()}
        onQuick={() => setQuickOpen(true)}
        onSearch={() => setSearchOpen(true)}
        onPalette={() => setPaletteOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        onToggleTheme={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
      />
      {workspace.error || activeTab?.saveError ? (
        <div className="error-banner" role="alert">
          <span>{workspace.error ?? activeTab?.saveError}</span>
          <button
            type="button"
            onClick={() => {
              workspace.clearError();
              if (activeTab) tabs.setSaveError(activeTab.path, null);
            }}
            aria-label="Hata bildirimini kapat"
          >
            ×
          </button>
        </div>
      ) : null}
      <section className="zen-stage">
        <section
          className={`editor-shell ${tabs.tabs.length ? "has-tabs" : ""}`}
          aria-label="Markdown yazma alanı"
        >
          {tabs.tabs.length ? (
            <TabBar
              tabs={tabs.tabs}
              activePath={tabs.activePath}
              onActivate={tabs.setActive}
              onClose={closeTab}
              onReorder={tabs.reorder}
            />
          ) : null}
          {activeTab ? (
            <MarkdownEditor
              key={`${activeTab.path}-${theme}-${jumpTarget?.path === activeTab.path ? jumpTarget.line : 0}`}
              value={activeTab.content}
              theme={theme}
              onChange={(content) => tabs.updateContent(activeTab.path, content)}
              onSelectionChange={(selection) => tabs.updateSelection(activeTab.path, selection)}
              fontSize={settingsStore.settings.editorFontSize}
              fontFamily={settingsStore.settings.editorFontFamily}
              lineWrapping={settingsStore.settings.lineWrapping}
              initialLine={jumpTarget?.path === activeTab.path ? jumpTarget.line : undefined}
            />
          ) : (
            <HomeDashboard
              workspaceOpen={Boolean(workspace.rootPath)}
              workspaceName={workspace.rootPath?.split(/[\\/]/).pop() ?? null}
              onOpen={(path) => void workspace.openFile(path)}
              onOpenWorkspace={() => void workspace.chooseWorkspace()}
              onDaily={() => void openDaily()}
              onNewFile={() => void createFile()}
              onQuick={() => setQuickOpen(true)}
              onActivity={() => setActivityOpen(true)}
            />
          )}
        </section>
        {filesOpen ? (
          <aside
            id="workspace-drawer"
            className="zen-drawer workspace-drawer"
            style={{ width: panels.leftWidth }}
          >
            <div className="drawer-heading">
              <div>
                <span className="eyebrow">KÜTÜPHANE</span>
                <h2>{workspace.rootPath?.split(/[\\/]/).pop() ?? "Çalışma alanı"}</h2>
              </div>
              {workspace.rootPath ? (
                <button
                  className="icon-action"
                  type="button"
                  onClick={() => void workspace.refreshTree()}
                  title="Dosya ağacını yenile"
                  aria-label="Dosya ağacını yenile"
                >
                  ↻
                </button>
              ) : null}
            </div>
            <div className="drawer-actions">
              <button type="button" onClick={() => void workspace.chooseWorkspace()}>
                Çalışma alanı aç
              </button>
              <button
                type="button"
                onClick={() => void createFile()}
                disabled={!workspace.rootPath}
              >
                Yeni dosya
              </button>
              <button
                type="button"
                onClick={() => void createFolder()}
                disabled={!workspace.rootPath}
              >
                Yeni klasör
              </button>
            </div>
            <p className="workspace-path" title={workspace.rootPath ?? undefined}>
              {workspace.rootPath ?? "Notlarınızın bulunduğu klasörü seçin."}
            </p>
            <div className="drawer-tree">
              {workspace.rootPath ? (
                <FileTree
                  nodes={workspace.tree}
                  activePath={tabs.activePath}
                  onOpenFile={(path) => {
                    setFilesOpen(false);
                    void workspace.openFile(path);
                  }}
                  onRename={(node) => void renameNode(node)}
                  onDelete={(node) => void deleteNode(node)}
                  onMove={(source, folder) => void moveNode(source, folder)}
                />
              ) : (
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => void workspace.chooseWorkspace()}
                >
                  Çalışma alanı seç
                </button>
              )}
            </div>
            <div
              className="drawer-resizer drawer-resizer-right"
              role="separator"
              aria-orientation="vertical"
              onPointerDown={panels.startResize}
            />
          </aside>
        ) : null}
      </section>
      {quickOpen ? <QuickCapture onClose={() => setQuickOpen(false)} onSave={saveQuick} /> : null}
      {paletteOpen ? (
        <CommandPalette commands={commands} onClose={() => setPaletteOpen(false)} />
      ) : null}
      {searchOpen ? (
        <SearchPanel
          onClose={() => setSearchOpen(false)}
          onOpen={(result) => {
            setSearchOpen(false);
            setJumpTarget({ path: result.path, line: result.line });
            void workspace.openFile(result.path);
          }}
        />
      ) : null}
      {activityOpen ? (
        <ActivityDashboard
          onClose={() => setActivityOpen(false)}
          onOpen={(path) => {
            setActivityOpen(false);
            void workspace.openFile(path);
          }}
        />
      ) : null}
      {settingsOpen ? <SettingsModal onClose={() => setSettingsOpen(false)} /> : null}
    </main>
  );
}
