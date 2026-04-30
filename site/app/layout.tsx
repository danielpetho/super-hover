import "./globals.css";
import Script from "next/script";
import { RouteTransition } from "@/components/route-transition";

const isDev = process.env.NODE_ENV === "development";

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
      </head>
      <body
        className="font-overused-grotesk antialiased"
      >
        <RouteTransition>{children}</RouteTransition>
      </body>
    </html>
  );
}
