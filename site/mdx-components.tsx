import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sandbox } from "@/components/sandbox";
import { mdxAnchorClassName } from "@/lib/mdx-anchor-class";
import { Preview } from "@/components/preview";
import { CodePen } from "@/components/codepen";
import { CodeSnippet } from "@/components/code-snippet";
import { InstallTabs } from "@/components/install-tabs";
import { FrameworkDocs } from "@/components/framework-docs";
import { FrameworkTabs } from "@/components/framework-tabs";
import { FrameworkCodeSnippet } from "@/components/framework-code-snippet";
import { Children, type ReactNode } from "react";
import { ExternalLinkIcon } from "lucide-react";
import { Callout } from "./components/callout";
import VideoPlayer from "./components/video";
import ImageComponent from "./components/image";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    h1: ({ className, children, ...props }: React.ComponentProps<"h1">) => (
      <h1
        id={children?.toString().toLowerCase().replace(/\s+/g, "-")}
        className={cn(
          "text-[44px] font-satoshi font-medium tracking-tighter text-pretty leading-tight pb-12",
          className
        )}
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ className, children, ...props }: React.ComponentProps<"h2">) => (
      <h2
        id={children?.toString().toLowerCase().replace(/\s+/g, "-")}
        className={cn("text-2xl font-semibold pt-10", className)}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ className, children, ...props }: React.ComponentProps<"h3">) => (
      <h3
        id={children?.toString().toLowerCase().replace(/\s+/g, "-")}
        className={cn("text-xl font-semibold pt-10", className)}
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({ className, children, ...props }: React.ComponentProps<"h4">) => (
      <h4
        id={children?.toString().toLowerCase().replace(/\s+/g, "-")}
        className={cn("text-lg font-semibold pt-4", className)}
        {...props}
      >
        {children}
      </h4>
    ),
    a: ({
      className,
      children,
      href,
      ...props
    }: React.ComponentProps<"a">) => {
      const isExternal =
        !!href &&
        /^(https?:\/\/|\/\/|mailto:|tel:)/i.test(href);

      const linkClassName = mdxAnchorClassName(className);

      if (!href) {
        return (
          <a className={linkClassName} {...props}>
            {children}
          </a>
        );
      }

      if (isExternal) {
        return (
          <a
            href={href}
            className={linkClassName}
            target="_blank"
            rel="noreferrer"
            {...props}
          >
            {children}
            <ExternalLinkIcon
              className="ml-1"
              size={13}
              strokeWidth={2.5}
            />
          </a>
        );
      }

      return (
        <Link href={href} className={linkClassName} {...props}>
          {children}
        </Link>
      );
    },
    p: ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className={cn("text-base text-pretty", className)} {...props} />
    ),
    ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul
        className={cn("list-disc ml-6 list-outside space-y-3", className)}
        {...props}
      />
    ),
    math: ({ children }) => (
      <BlockMath>{children}</BlockMath>
    ),
    inlineMath: ({ children }) => (
      <InlineMath>{children}</InlineMath>
    ),
    ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
      <ol
        className={cn(
          "list-outside list-decimal mb-[1em] mt-[1em] ml-6 space-y-3",
          className
        )}
        {...props}
      />
    ),
    li: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <li className={cn("marker:text-sm first:mt-3", className)} {...props} />
    ),
    blockquote: ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLElement>) => (
      <blockquote
        className={cn("mt-2 border-l-1 pl-0 px-6", className)}
        style={{ fontVariationSettings: "'slnt' -10" }}
        {...props}
      />
    ),
    img: ({
      className,
      alt,
      ...props
    }: React.ImgHTMLAttributes<HTMLImageElement>) => (
      //@ts-expect-error img src expects a Blob or string
      <ImageComponent src={props.src as string} alt={alt as string} caption={true} className={className} {...props} />
    ),
    hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
      <hr className="" {...props} />
    ),
    code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <code
        className={cn(
          "font-fira-mono text-[13px] px-1.5 py-0.5 border border-border rounded-md leading-6 bg-muted whitespace-nowrap",
          className
        )}
        {...props}
      />
    ),
    CodeSnippet: ({
      className,
      title,
      children,
      ...props
    }: React.HTMLAttributes<HTMLElement> & {
      title?: string;
    }) => {
      // Extract code content and language from children
      const preElement = Children.toArray(children)[0] as React.ReactElement;

      //@ts-ignore
      const codeElement = preElement?.props?.children as React.ReactElement<{
        className?: string;
        children?: string;
      }>;

      if (!codeElement) return null;

      const code = codeElement.props.children || "";
      const language =
        codeElement.props.className?.replace("language-", "") || "typescript";

      return (
        <CodeSnippet
          title={title}
          code={code}
          language={language}
          {...props}
        />
      );
    },
    Sandbox: ({
      className,
      demo,
      name,
      ...props
    }: React.HTMLAttributes<HTMLElement> & {
      demo?: string;
      /** Alias for `demo` (folder under `embeds/sandbox/`). */
      name?: string;
    }) => (
      <div className={cn("w-full max-w-3xl", className)} {...props}>
        <Sandbox demo={demo ?? name} />
      </div>
    ),
    Preview: ({
      className,
      name,
      showCode,
      showRestart,
      border,
      description,
      ...props
    }: React.HTMLAttributes<HTMLElement> & {
      name?: string;
      showCode?: boolean | "true" | "false";
      showRestart?: boolean;
      border?: boolean | "true" | "false";
      description?: ReactNode;
    }) =>
      name ? (
        <Preview
          name={name}
          showCode={showCode}
          showRestart={showRestart}
          border={border}
          description={description}
          className={cn("my-8", className)}
          frameClassName={className}
          {...props}
        />
      ) : null,
    CodePen: ({
      className,
      penId,
      title,
      user,
      height,
      defaultTab,
      ...props
    }: React.HTMLAttributes<HTMLElement> & {
      penId: string;
      title?: string;
      user?: string;
      height?: number;
      defaultTab?: "result" | "html" | "css" | "js";
    }) => (
      <div className={cn("w-full max-w-3xl", className)}>
        <CodePen
          penId={penId}
          title={title}
          user={user}
          height={height}
          defaultTab={defaultTab}
          {...props}
        />
      </div>
    ),
    InstallTabs: ({
      className,
      command,
      npx,
      ...props
    }: React.HTMLAttributes<HTMLElement> & {
      command: string;
      npx?: boolean;
    }) => (
      <InstallTabs
        command={command}
        npx={npx}
        {...props}
      />
    ),
    FrameworkDocs: ({
      children,
      defaultFramework,
    }: React.HTMLAttributes<HTMLElement> & {
      defaultFramework?: "react" | "ts" | "vue" | "svelte";
    }) => (
      <FrameworkDocs defaultFramework={defaultFramework}>{children}</FrameworkDocs>
    ),
    FrameworkTabs: ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLElement>) => (
      <FrameworkTabs className={className} {...props} />
    ),
    FrameworkCodeSnippet: ({
      title,
      react,
      ts,
      vue,
      svelte,
      reactLanguage,
      tsLanguage,
      vueLanguage,
      svelteLanguage,
      ...props
    }: React.HTMLAttributes<HTMLElement> & {
      title?: string;
      react: string;
      ts: string;
      vue: string;
      svelte: string;
      reactLanguage?: string;
      tsLanguage?: string;
      vueLanguage?: string;
      svelteLanguage?: string;
    }) => (
      <FrameworkCodeSnippet
        title={title}
        react={react}
        ts={ts}
        vue={vue}
        svelte={svelte}
        reactLanguage={reactLanguage}
        tsLanguage={tsLanguage}
        vueLanguage={vueLanguage}
        svelteLanguage={svelteLanguage}
        {...props}
      />
    ),
    Callout: ({
      className,
      variant,
      badge,
      children,
      ...props
    }: React.HTMLAttributes<HTMLElement> & {
      variant?: "info" | "warning";
      badge?: {
        type: "icon" | "badge";
        content: React.ReactNode;
      };
    }) => (
      <Callout
        variant={variant}
        badge={badge}
        className={cn("mt-12", className)}
        {...props}
      >
        {children}
      </Callout>
    ),
    Video: ({ src, poster, controls, autoPlay, loop, muted, caption, className, ...props }) => (
        <VideoPlayer src={src} poster={poster} controls={controls} autoPlay={autoPlay} loop={loop} muted={muted} caption={caption} className={className} {...props} />
    ),
    ...components,
  };
}
