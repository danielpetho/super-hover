"use client";

import React from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  SandpackFiles,
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
    | "vite-react-ts";
}

interface DemoData {
  demo: string;
  files: ExerciseFile[];
}

// Component for fullscreen layout with resizable panels
function FullscreenSandboxLayout({ setIsFullscreen }: { setIsFullscreen: (value: boolean) => void }) {
  const isDark = useIsDarkMode();
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-screen">
      <ResizablePanel defaultSize={50} minSize={20}>
        <SandpackCodeEditor showTabs showLineNumbers className="h-full" />
      </ResizablePanel>
      <ResizableHandle className={isDark ? "bg-[#252525]" : "bg-zinc-200"} />
      <ResizablePanel defaultSize={50} minSize={20} className="h-full">
        <PreviewConsolePanel isFullscreen={true} setIsFullscreen={setIsFullscreen} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

// Reusable component for the preview/console panel
function PreviewConsolePanel({ isFullscreen, setIsFullscreen }: { 
  isFullscreen: boolean; 
  setIsFullscreen: (value: boolean) => void; 
}) {
  return (
    <div className="flex-1 flex flex-col h-full">
      <Tabs
        defaultValue="preview"
        className="flex-1 flex w-full flex-col gap-0 bg-zinc-100 dark:bg-editor-background"
      >
        <div className="flex h-11 flex-row justify-between border-b border-zinc-200 bg-zinc-100 px-3 dark:border-editor-border dark:bg-editor-background">
          <TabsList className="flex h-[42px] items-center gap-x-3 rounded-none border-none bg-zinc-100 pt-1 font-normal dark:bg-editor-background">
            <TabsTrigger
              value="preview"
              className="h-auto cursor-pointer border-none bg-transparent px-2 py-1 text-sm font-normal text-zinc-450 transition-colors duration-200 ease-out hover:bg-transparent hover:text-zinc-900 data-active:border-none data-active:bg-transparent data-active:text-zinc-950 data-active:shadow-none focus-visible:ring-0 focus-visible:outline-none dark:text-muted-foreground dark:hover:bg-transparent dark:hover:text-white dark:data-active:border-none dark:data-active:bg-transparent dark:data-active:text-white shadow-none! font-medium"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="console"
              className="h-auto cursor-pointer border-none bg-transparent px-2 py-1 text-sm font-normal text-zinc-450 transition-colors duration-200 ease-out hover:bg-transparent hover:text-zinc-900 data-active:border-none data-active:bg-transparent data-active:text-zinc-950 data-active:shadow-none focus-visible:ring-0 focus-visible:outline-none dark:text-muted-foreground dark:hover:bg-transparent dark:hover:text-white dark:data-active:border-none dark:data-active:bg-transparent dark:data-active:text-white shadow-none! font-medium"
            >
              Console
            </TabsTrigger>
          </TabsList>

          <SandboxMenu isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} />
        </div>

        <TabsContent
          value="preview"
          className="flex-1 m-0 min-h-0 h-full"
        >
          <SandpackPreview className="h-full" showOpenInCodeSandbox={false}/>
        </TabsContent>
        <TabsContent
          value="console"
          className="flex-1 m-0 min-h-0 h-full"
        >
          <SandpackConsole className="h-full" />
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
        <div className="absolute top-1/2 left-1/2 flex h-[530px] w-[850px] -translate-x-1/2 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 shadow-xl dark:border-editor-border dark:bg-editor-background">
          <div className="text-muted-foreground">Loading exercise...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <div className="absolute top-1/2 left-1/2 flex h-[530px] w-[850px] -translate-x-1/2 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 shadow-xl dark:border-editor-border dark:bg-editor-background">
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
        files={files}
        //@ts-expect-error SandpackProvider's theme prop type definition doesn't fully match our custom theme object structure
        theme={isDark ? spThemeDark : spThemeLight}
        template={config.template || "react-ts"}
        customSetup={{
          dependencies: {
            react: "^18.0.0",
            "react-dom": "^18.0.0",
            ...(config.customSetup?.dependencies || {}),
          },
          // devDependencies: {
          //   "@types/react": "^18.0.0",
          //   "@types/react-dom": "^18.0.0",
          //   "typescript": "^5",
          // },
          entry: config.customSetup?.entry || "/index.tsx",
        }}
        options={{
          initMode: "user-visible",
          classes: {
            "sp-wrapper": ``,
            "sp-layout": `absolute ${
              isFullscreen
                ? "!w-screen !h-screen !top-0 !left-0 !rounded-none !border-none !overflow-auto"
                : `top-1/2 left-1/2 -translate-x-1/2 flex w-[850px] h-[530px] !rounded-2xl !border !overflow-hidden ${isDark ? "!border-[#252525]" : "!border-[#e4e4e7]"}`
            }`,
            "sp-tabs": "h-11 flex px-3 w-full",
            "sp-tabs-scrollable-container": "!p-0 gap-x-3",
            "sp-tab-container": "flex justify-center !px-0 overflow-auto",
            "sp-tab-button":
              isDark
                ? "cursor-pointer !h-auto !border-0 !bg-transparent !px-2 !py-1 !text-sm !font-normal !text-muted-foreground !shadow-none hover:!bg-transparent hover:!text-white aria-selected:!border-0 aria-selected:!bg-transparent aria-selected:!text-white aria-selected:!shadow-none focus-visible:!ring-0 focus-visible:!outline-none"
                : "cursor-pointer !h-auto !border-0 !bg-transparent !px-2 !py-1 !text-sm !font-normal !text-zinc-500 !shadow-none hover:!bg-transparent hover:!text-zinc-900 aria-selected:!border-0 aria-selected:!bg-transparent aria-selected:!text-zinc-950 aria-selected:!shadow-none focus-visible:!ring-0 focus-visible:!outline-none",
            "sp-editor": `!overflow-auto ${isFullscreen ? "!h-screen" : "h-[530px]"}`,
            "sp-code-editor": "!h-full !overflow-auto",
            "sp-preview-container": "!h-full",
            "sp-preview": "!h-full !flex",
            "sp-preview-iframe": "!h-full !flex",
            "sp-loading": "!h-full",
            "sp-error": "!h-full",
            "sp-iframe": "!h-full !w-full",
            "cm-gutterElement": "!text-sm",
          },
        }}
      >
        <SandpackLayout>
          {isFullscreen ? (
            <FullscreenSandboxLayout setIsFullscreen={setIsFullscreen} />
          ) : (
            <>
              <div className="w-1/2">
                <SandpackCodeEditor showTabs showLineNumbers className="" />
              </div>
              <PreviewConsolePanel isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} />
            </>
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
