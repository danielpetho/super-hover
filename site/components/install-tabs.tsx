"use client"

import React, { useState } from 'react';
import { CopyButton } from './copy-button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Highlight, PrismTheme } from 'prism-react-renderer';
import lightTheme from '@/prism-theme.json';
import darkTheme from '@/prism-theme-dark.json';
import { useIsDarkMode } from '@/lib/use-is-dark-mode';

interface InstallTabsProps {
  command: string;
  npx?: boolean;
}

type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

const packageManagers: Array<{ id: PackageManager; label: string }> = [
  { id: 'pnpm', label: 'pnpm' },
  { id: 'npm', label: 'npm' },
  { id: 'yarn', label: 'yarn' },
  { id: 'bun', label: 'bun' },
];

export const InstallTabs: React.FC<InstallTabsProps> = ({
  command,
  npx = false,
}) => {
  const [activeTab, setActiveTab] = useState<PackageManager>('pnpm');
  const isDark = useIsDarkMode();

  const getCommandPrefix = (pm: PackageManager): string => {
    if (npx) {
      switch (pm) {
        case 'pnpm':
          return 'pnpm dlx';
        case 'npm':
          return 'npx';
        case 'yarn':
          return 'npx';
        case 'bun':
          return 'bunx --bun';
        default:
          return 'npx';
      }
    } else {
      switch (pm) {
        case 'pnpm':
          return 'pnpm add';
        case 'npm':
          return 'npm i';
        case 'yarn':
          return 'yarn add';
        case 'bun':
          return 'bun add';
        default:
          return 'npm i';
      }
    }
  };

  const getFullCommand = (pm: PackageManager): string => {
    const prefix = getCommandPrefix(pm);
    return `${prefix} ${command}`;
  };

  const handleCopy = async () => {
    const fullCommand = getFullCommand(activeTab);
    await navigator.clipboard.writeText(fullCommand);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-editor-border dark:bg-editor-background">
      <div className="flex h-11 items-center justify-between border-b border-neutral-200 bg-neutral-100 py-2 pl-4 pr-3 dark:border-editor-border dark:bg-editor-background">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as PackageManager)}
          className="flex-1"
        >
          <TabsList className="bg-transparent h-auto p-0">
            {packageManagers.map((pm) => (
              <TabsTrigger
                key={pm.id}
                value={pm.id}
                className="h-auto cursor-pointer px-2 py-1 text-sm text-neutral-500 duration-200 ease-out hover:bg-neutral-900 hover:bg-transparent hover:text-neutral-900 data-active:text-neutral-950 dark:text-muted-foreground dark:hover:bg-transparent dark:hover:text-white dark:data-active:bg-editor-background dark:data-active:text-white shadow-none! active:scale-96 duration-200 ease-out transition-all"
              >
                {pm.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <CopyButton onCopy={handleCopy} />
      </div>
      <div className="bg-neutral-100 py-4 dark:bg-editor-background">
        <Highlight
          theme={(isDark ? darkTheme : lightTheme) as PrismTheme}
          code={getFullCommand(activeTab)}
          language="bash"
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} overflow-x-auto font-mono text-[13px] font-medium`}
              style={style}
            >
              {tokens.map((line, i) => (
                <div
                  key={i}
                  {...getLineProps({ line })}
                  className="flex min-w-full w-max items-center px-4 py-px hover:bg-neutral-200/60 dark:hover:bg-editor-border"
                >
                  <span className="mr-4 flex items-center text-right text-[10px] text-neutral-500 select-none dark:text-muted-foreground">
                    1
                  </span>
                  <span>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
};
