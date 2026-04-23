import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  ListRestartIcon,
  MaximizeIcon,
  RefreshCcwIcon,
  SquareArrowOutUpRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const springConfig = {
  duration: 0.3,
  ease: "easeInOut",
};

const items = [
  {
    label: "Reset Code",
    icon: ListRestartIcon,
  },
  {
    label: "Open in CodeSandbox",
    icon: SquareArrowOutUpRight,
  },
  {
    label: "Full Screen",
    icon: MaximizeIcon,
  },
  {
    label: "Refresh Preview",
    icon: RefreshCcwIcon,
  },
];

const SandboxMenu = ({
  isFullscreen,
  setIsFullscreen,
  onResetCode,
  onRefreshPreview,
}: {
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
  onResetCode: () => void;
  onRefreshPreview: () => void;
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({
    left: 0,
    width: 0,
  });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeIndex !== null && menuRef.current && tooltipRef.current) {
      const menuItem = menuRef.current.children[activeIndex] as HTMLElement;
      const menuRect = menuRef.current.getBoundingClientRect();
      const itemRect = menuItem.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      const left =
        itemRect.left -
        menuRect.left +
        (itemRect.width - tooltipRect.width) / 2;

      setTooltipPosition({
        left: Math.max(0, Math.min(left, menuRect.width - tooltipRect.width)),
        width: tooltipRect.width,
      });
    }
  }, [activeIndex]);

  return (
    <div className="flex items-center flex-row">

      <TooltipProvider delay={0}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer text-neutral-500 hover:text-neutral-900 dark:text-muted-foreground dark:hover:text-white"
                onClick={onResetCode}
              >
                <ListRestartIcon size={10} className="p-px" />
              </Button>
            }
          />
          <TooltipContent>
            <p>Reset Code</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer text-neutral-500 hover:text-neutral-900 dark:text-muted-foreground dark:hover:text-white"
              >
                <SquareArrowOutUpRight size={10} className="p-px" />
              </Button>
            }
          />
          <TooltipContent>
            <p>Open in CodeSandbox</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer text-neutral-500 hover:text-neutral-900 dark:text-muted-foreground dark:hover:text-white"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <MaximizeIcon size={10} className="p-px" />
              </Button>
            }
          />
          <TooltipContent>
            <p>{isFullscreen ? "Exit Full Screen" : "Full Screen"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer text-neutral-500 hover:text-neutral-900 dark:text-muted-foreground dark:hover:text-white"
                onClick={onRefreshPreview}
              >
                <RefreshCcwIcon size={10} className="p-px" />
              </Button>
            }
          />
          <TooltipContent>
            <p>Refresh Preview</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SandboxMenu;
