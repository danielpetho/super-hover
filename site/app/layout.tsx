import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { SiteShell } from "@/components/site-shell";
import { Toaster } from "@/components/ui/sonner";
import { getSiteBaseUrl } from "@/lib/site-url";
import { Agentation } from "agentation";

const isDev = process.env.NODE_ENV === "development";
const siteUrl = getSiteBaseUrl();
const title = "Super Hover";
const description =
  "A tiny library that hit-tests hover every frame, keeping hover state accurate while you scroll or when things move on screen.";
const ogImage = "/opengraph-image.jpg";
const author = {
  name: "Daniel Petho",
  url: "https://x.com/nonzeroexitcode",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: title,
  title: {
    default: title,
    template: `%s | ${title}`,
  },
  description,
  authors: [author],
  creator: author.name,
  publisher: author.name,
  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
        sizes: "1024x1024",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  keywords: [
    "hover",
    "pointer",
    "scroll",
    "DOM",
    "React",
    "Vue",
    "Svelte",
    "TypeScript",
    "super-hover",
  ],
  alternates: {
    canonical: "/",
    types: {
      "text/markdown": [
        { url: "/react.md", title: "React documentation" },
        { url: "/vue.md", title: "Vue documentation" },
        { url: "/ts.md", title: "TypeScript documentation" },
        { url: "/svelte.md", title: "Svelte documentation" },
        { url: "/llms.txt", title: "LLMs index" },
      ],
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: title,
    title,
    description,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Super Hover cursor mark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
    creator: "@danielpetho",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "developer tools",
  classification: "JavaScript library",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: title,
      url: siteUrl,
      description,
      author: {
        "@id": `${author.url}#person`,
      },
      image: `${siteUrl}${ogImage}`,
      inLanguage: "en",
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": `${siteUrl}/#source`,
      name: title,
      description,
      url: siteUrl,
      codeRepository: "https://github.com/danielpetho/super-hover",
      license: "https://opensource.org/license/mit",
      programmingLanguage: ["TypeScript", "JavaScript"],
      runtimePlatform: ["React", "Vue", "Svelte", "Web browser"],
      author: {
        "@type": "Person",
        "@id": `${author.url}#person`,
        name: author.name,
        url: author.url,
      },
      image: `${siteUrl}${ogImage}`,
      sameAs: [
        "https://www.npmjs.com/package/super-hover",
        "https://github.com/danielpetho/super-hover",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {isDev ? (
          <Script
            src="//unpkg.com/react-scan/dist/auto.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        ) : null}
        <link rel="author" href={author.url} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="font-overused-grotesk antialiased">
        <SiteShell>{children}</SiteShell>
        <Toaster />
        {isDev && <Agentation />}
      </body>
    </html>
  );
}
