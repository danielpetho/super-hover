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

import spTheme from "@/sandpack-theme.json";
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
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-screen">
      <ResizablePanel defaultSize={50} minSize={20}>
        <SandpackCodeEditor showTabs showLineNumbers className="h-full" />
      </ResizablePanel>
      <ResizableHandle className="bg-[#252525]" />
      <ResizablePanel defaultSize={50} minSize={20} className="h-full">
        <PreviewConsolePanel isFullscreen={true} setIsFullscreen={setIsFullscreen}  />
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
        className="flex-1 flex flex-col bg-editor-background gap-0 w-full"
      >
        <div className="border-b border-editor-border bg-editor-background p-0 justify-between h-11 flex flex-row px-3">
          <TabsList className="flex items-center rounded-none bg-editor-background gap-x-3 border-none h-[42px] pt-1 font-normal">
            <TabsTrigger
              value="preview"
              className="text-white data-[state=active]:bg-editor-background bg-editor-background data-[state=active]:border-none data-[state=inactive]:bg-transparent border-none data-[state=inactive]:hover:text-white cursor-pointer font-normal"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="console"
              className="text-white data-[state=active]:bg-editor-background bg-editor-background cursor-pointer data-[state=active]:border-none data-[state=inactive]:bg-transparent border-none data-[state=inactive]:hover:text-white font-normal py-0 h-10"
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2  flex w-[850px] !rounded-2xl shadow-xl h-[530px] !border !border-border bg-editor-background justify-center items-center">
          <div className="text-muted-foreground">Loading exercise...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2  flex w-[850px] !rounded-2xl shadow-xl h-[530px] !border !border-border bg-editor-background justify-center items-center">
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
        theme={spTheme}
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
                : "top-1/2 left-1/2 -translate-x-1/2 flex w-[850px] h-[530px] !rounded-2xl !border !border-[#252525] !overflow-hidden"
            }`,
            "sp-tabs": "h-11 flex px-3 w-full",
            "sp-tabs-scrollable-container": "!p-0 gap-x-3",
            "sp-tab-container": "flex justify-center !px-0 overflow-auto",
            "sp-tab-button":
              "hover:text-white !text-sm font !text-muted-foreground data-[state=active]:!text-white cursor-pointer",
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
