"use client";

import * as React from "react";

export function useIsDarkMode() {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;

    const update = () => {
      setIsDark(root.classList.contains("dark"));
    };

    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    update();

    return () => {
      observer.disconnect();
    };
  }, []);

  return isDark;
}
