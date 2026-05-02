import { cn } from "@/lib/utils";

export function mdxAnchorClassName(className?: string) {
  return cn(
    "font-medium text text-blue hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-500 duration-300 ease-out transition inline-flex items-center leading-0",
    className,
  );
}
