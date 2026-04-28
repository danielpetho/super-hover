"use client";

import * as React from "react";

export type FrameworkId = "react" | "ts" | "vue" | "svelte";

type FrameworkDocsContextValue = {
  framework: FrameworkId;
  setFramework: (framework: FrameworkId) => void;
};

const FrameworkDocsContext = React.createContext<FrameworkDocsContextValue | null>(
  null,
);

export function useFrameworkDocs(): FrameworkDocsContextValue {
  const context = React.useContext(FrameworkDocsContext);
  if (!context) {
    throw new Error("useFrameworkDocs must be used inside <FrameworkDocs />");
  }
  return context;
}

export function FrameworkDocs({
  children,
  defaultFramework = "react",
}: {
  children: React.ReactNode;
  defaultFramework?: FrameworkId;
}) {
  const [framework, setFramework] = React.useState<FrameworkId>(defaultFramework);

  const value = React.useMemo(
    () => ({ framework, setFramework }),
    [framework, setFramework],
  );

  return (
    <FrameworkDocsContext.Provider value={value}>
      {children}
    </FrameworkDocsContext.Provider>
  );
}

