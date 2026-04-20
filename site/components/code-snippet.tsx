"use client"

import React from 'react';
import { CopyButton } from './copy-button';
import { Highlight, PrismTheme } from 'prism-react-renderer';
import theme from '@/prism-theme.json';

interface CodeSnippetProps {
  title?: string;
  code: string;
  language?: string;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({
  title,
  code,
  language = 'typescript',
}) => {
  const lines = code.trim().split('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
  };

  return (
    <div className="border border-editor-border rounded-xl overflow-hidden bg-editor-background">
      {title ? (
        <div className="flex h-11 items-center justify-between border-b border-editor-border bg-editor-background py-2 pl-4 pr-3">
          <h3 className="text-white text-sm font-medium">{title}</h3>
          <CopyButton onCopy={handleCopy} />
        </div>
      ) : null}
      <div className="relative max-h-[min(70vh,520px)] overflow-y-auto bg-editor-background py-4">
        {!title && (
          <div className={`absolute ${
            lines.length === 1 
              ? "top-1/2 -translate-y-1/2 right-3" 
              : "top-4 right-3"
          }`}>
            <CopyButton
              onCopy={handleCopy}
            />
          </div>
        )}
        <Highlight
          theme={theme as PrismTheme}
          code={code.trim()}
          language={language}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={`${className} text-[13px] overflow-x-auto font-mono font-medium whitespace-pre-wrap`} style={style}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="flex items-center hover:bg-editor-border py-px px-4">
                  <span className="mr-4 select-none text-muted-foreground text-right text-[10px] items-center flex">
                    {i + 1}
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