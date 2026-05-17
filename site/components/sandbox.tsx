"use client";

import React from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  SandpackFiles,
  useSandpackNavigation,
} from "@codesandbox/sandpack-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useState } from "react";
import { useEffect } from "react";

import spThemeDark from "@/sandpack-theme-dark.json";
import spThemeLight from "@/sandpack-theme-light.json";
import { useIsDarkMode } from "@/lib/use-is-dark-mode";
import SandboxMenu from "./sandbox-menu";

interface ExerciseFile {
  name: string;
  content: string;
}

interface FileConfig {
  active?: boolean;
  hidden?: boolean;
}

interface ExerciseConfig {
  files: {
    [key: string]: FileConfig;
  };
  customSetup?: {
    dependencies?: Record<string, string>;
    entry?: string;
  };
  template?:
    | "static"
    | "angular"
    | "react"
    | "react-ts"
    | "solid"
    | "svelte"
    | "test-ts"
    | "vanilla-ts"
    | "vanilla"
    | "vue"
    | "vue-ts"
    | "node"
    | "nextjs"
    | "vite"
    | "vite-react"
    | "vite-react-ts"
    | "vite-svelte-ts";
}

interface DemoData {
  demo: string;
  files: ExerciseFile[];
}

// Component for fullscreen layout with resizable panels
function FullscreenSandboxLayout({
  setIsFullscreen,
  onResetCode,
}: {
  setIsFullscreen: (value: boolean) => void;
  onResetCode: () => void;
}) {
  const { refresh } = useSandpackNavigation();
  const isDark = useIsDarkMode();
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-screen">
      <ResizablePanel defaultSize={50} minSize={20} className="min-w-0">
        <SandpackCodeEditor showTabs showLineNumbers className="h-full" />
      </ResizablePanel>
      <ResizableHandle className={isDark ? "bg-[#252525]" : "bg-neutral-200"} />
      <ResizablePanel defaultSize={50} minSize={20} className="h-full min-w-0">
        <PreviewConsolePanel
          isFullscreen={true}
          setIsFullscreen={setIsFullscreen}
          onResetCode={onResetCode}
          onRefreshPreview={refresh}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function PreviewConsolePanel({
  isFullscreen,
  setIsFullscreen,
  onResetCode,
  onRefreshPreview,
}: { 
  isFullscreen: boolean; 
  setIsFullscreen: (value: boolean) => void; 
  onResetCode: () => void;
  onRefreshPreview?: () => void;
}) {
  const navigation = useSandpackNavigation();
  const refreshPreview = onRefreshPreview ?? navigation.refresh;
  const [activePanel, setActivePanel] = useState<"preview" | "console">("preview");
  const [consoleLogCount, setConsoleLogCount] = useState(0);

  return (
    <div className="flex-1 flex flex-col h-full">
      <Tabs
        value={activePanel}
        onValueChange={(value) => {
          setActivePanel(value as "preview" | "console");
        }}
        className="flex-1 flex w-full flex-col gap-0 bg-editor-bg!"
      >
        <div className="flex h-11 flex-row justify-between border-b-[0.5px] border-neutral-200 bg-editor-bg px-3 dark:border-editor-border">
          <TabsList className="flex h-[42px] items-center gap-x-3 rounded-none border-none bg-editor-bg pt-1 font-normal">
            <TabsTrigger
              value="preview"
              className="h-auto cursor-pointer border-none bg-transparent px-2 py-1 text-sm font-normal text-neutral-500 transition-colors duration-200 ease-out hover:bg-transparent hover:text-neutral-900 data-active:border-none data-active:bg-transparent data-active:text-neutral-950 data-active:shadow-none focus-visible:ring-0 focus-visible:outline-none dark:text-muted-foreground dark:hover:bg-transparent dark:hover:text-white dark:data-active:border-none dark:data-active:bg-transparent dark:data-active:text-white shadow-none! font-medium duration-200 ease-out transition-all active:scale-97"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="console"
              className="h-auto cursor-pointer border-none bg-transparent px-2 py-1 text-sm font-normal text-neutral-500 transition-colors duration-200 ease-out hover:bg-transparent hover:text-neutral-900 data-active:border-none data-active:bg-transparent data-active:text-neutral-950 data-active:shadow-none focus-visible:ring-0 focus-visible:outline-none dark:text-muted-foreground dark:hover:bg-transparent dark:hover:text-white dark:data-active:border-none dark:data-active:bg-transparent dark:data-active:text-white shadow-none! font-medium duration-200 ease-out transition-all active:scale-97"
            >
              Console
            </TabsTrigger>
          </TabsList>

          <SandboxMenu
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
            onResetCode={onResetCode}
            onRefreshPreview={refreshPreview}
          />
        </div>

        <TabsContent
          value="preview"
          keepMounted
          className="flex-1 m-0 min-h-0 h-full"
        >
          <SandpackPreview
            className="h-full"
            showOpenInCodeSandbox={false}
            showRefreshButton={false}
          />
        </TabsContent>
        <TabsContent
          value="console"
          className="relative flex-1 m-0 min-h-0 h-full"
        >
          <SandpackConsole
            className="h-full"
            onLogsChange={(logs) => setConsoleLogCount(logs.length)}
            showHeader
            resetOnPreviewRestart={false}
          />
          {activePanel === "console" && consoleLogCount === 0 ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
              No console output yet. Logs and errors from the preview will appear here.
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function Sandbox({
  demo,
}: {
  /** Folder name under /demos; loads /public/l/<demo>.json */
  demo?: string;
}) {
  const isDark = useIsDarkMode();
  const [files, setFiles] = useState<SandpackFiles>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [providerKey, setProviderKey] = useState(0);
  const [config, setConfig] = useState<ExerciseConfig>({
    files: {},
    template: "react-ts",
    customSetup: {
      dependencies: {
        react: "^18.0.0",
        "react-dom": "^18.0.0",
      },
      entry: "/index.tsx",
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handleResetCode = () => {
    setProviderKey((value) => value + 1);
  };

  useEffect(() => {
    if (!demo) {
      setError("A demo name is required (see embeds/sandbox/<id>/)");
      setLoading(false);
      return;
    }

    const loadFiles = async () => {
      try {
        const response = await fetch(`/l/${demo}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load exercise: ${response.statusText}`);
        }

        const exerciseData: DemoData = await response.json();

        // First, find and parse the config
        const configFile = exerciseData.files.find(
          (file) => file.name === "config.json"
        );
        let parsedConfig: ExerciseConfig = {
          files: {},
          template: "react-ts",
          customSetup: {
            dependencies: {
              react: "^18.0.0",
              "react-dom": "^18.0.0",
            },
            entry: "/index.tsx",
          },
        };

        if (configFile) {
          try {
            parsedConfig = JSON.parse(configFile.content);
          } catch (err) {
            console.error("Failed to parse config.json:", err);
          }
        }

        // Transform files to Sandpack format
        const sandpackFiles: SandpackFiles = {};
        exerciseData.files.forEach((file) => {
          if (file.name !== "config.json") {
            const fileConfig = parsedConfig.files?.[file.name] || {};
            sandpackFiles[`/${file.name}`] = {
              code: file.content,
              ...fileConfig,
            };
          }
        });

        setConfig(parsedConfig);
        setFiles(sandpackFiles);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load exercise"
        );
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [demo]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [isFullscreen]);

  if (loading) {
    return (
      <div className="relative">
        <div className="absolute top-1/2 left-1/2 flex h-[530px] w-[850px] -translate-x-1/2 items-center justify-center rounded-2xl border-[0.5px] border-neutral-200 bg-editor-bg shadow-xl dark:border-editor-border">
          <div className="text-muted-foreground">Loading exercise...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <div className="absolute top-1/2 left-1/2 flex h-[530px] w-[850px] -translate-x-1/2 items-center justify-center rounded-2xl border-[0.5px] border-neutral-200 bg-editor-bg shadow-xl dark:border-editor-border">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        isFullscreen
          ? "fixed w-screen h-screen top-0 left-0 z-50"
          : "relative min-h-[530px]"
      }
    >
      <SandpackProvider
        key={providerKey}
        files={files}
        //@ts-expect-error SandpackProvider's theme prop type definition doesn't fully match our custom theme object structure
        theme={isDark ? spThemeDark : spThemeLight}
        template={config.template || "react-ts"}
        customSetup={config.customSetup}
        options={{
          initMode: "immediate",
          classes: {
            "sp-wrapper": ``,
            "sp-layout": `absolute ${
              isFullscreen
                ? "!w-screen !h-screen !top-0 !left-0 !rounded-none !border-none !overflow-auto overscroll-contain"
                : `top-1/2 left-1/2 -translate-x-1/2 flex w-[850px] h-[530px] !rounded-2xl !border-[0.5px] !overflow-hidden ${isDark ? "!border-[#252525]" : "!border-[#e4e4e7]"}`
            }`,
            "sp-tabs": "h-11 flex! min-w-0 w-full! border-b-[0.5px]! overflow-hidden!",
            "sp-tabs-scrollable-container": "!p-0 gap-x-2 flex! min-w-0 max-w-full !px-2 overflow-x-auto! overflow-y-hidden! overscroll-x-contain whitespace-nowrap",
            "sp-tab-container":
              isDark
                ? "flex shrink-0! justify-center !px-0 outline-none! border-none! ring-0! !text-muted-foreground aria-selected:!text-white!"
                : "flex shrink-0! justify-center !px-0 outline-none! border-none! ring-0! hover:!text-neutral-950! active:scale-97 duration-200 ease-out aria-selected:!text-neutral-950",
            "sp-tab-button":
              isDark
                ? "cursor-pointer !h-auto !border-0 !bg-transparent !px-2 !py-1 !text-sm !font-medium !shadow-none whitespace-nowrap! hover:!bg-transparent hover:!text-white aria-selected:!border-0 aria-selected:!bg-transparent aria-selected:!text-white  focus-visible:!ring-0 focus-visible:!outline-none"
                : "cursor-pointer !h-auto !border-0 !bg-transparent px-2! py-1! !text-sm !font-medium !text-neutral-500 !shadow-none whitespace-nowrap! hover:!bg-transparent hover:!text-neutral-900 aria-selected:!border-0 aria-selected:!bg-transparent focus-visible:!ring-0 focus-visible:!outline-none data-[active=true]:!text-neutral-950",
           
            "sp-editor": `!overflow-auto overscroll-contain  ${isFullscreen ? "!h-screen" : "h-[530px]"}`,
            "sp-code-editor": "!h-full !overflow-auto overscroll-contain border-none!",
            "sp-preview-container": "!h-full",
            "sp-preview": "!h-full !flex",
            "sp-preview-iframe": "!h-full !flex",
            "sp-loading": "!h-full",
            "sp-error": "!h-full",
            "sp-iframe": "!h-full !w-full",
            "cm-gutterElement": "!text-sm",
            "sp-icon-standalone": "!hidden"
          },
        }}
      >
        <SandpackLayout>
          {isFullscreen ? (
            <FullscreenSandboxLayout
              setIsFullscreen={setIsFullscreen}
              onResetCode={handleResetCode}
            />
          ) : (
            <>
              <div className="min-w-0 w-1/2 overflow-hidden">
                <SandpackCodeEditor showTabs showLineNumbers className="" />
              </div>
              <PreviewConsolePanel
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
                onResetCode={handleResetCode}
              />
            </>
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
