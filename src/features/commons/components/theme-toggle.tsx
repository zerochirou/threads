"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { RiMoonLine, RiSunLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
}

function useIsMounted() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useIsMounted()

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("size-8 text-muted-foreground", className)}
        aria-label="Toggle theme"
      >
        <span className="size-4" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"
  const toggleLabel = `Switch to ${isDark ? "light" : "dark"} mode`

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "size-8 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors cursor-pointer",
              className
            )}
            aria-label={toggleLabel}
          >
            {isDark ? (
              <RiSunLine className="size-5 transition-transform hover:rotate-45" />
            ) : (
              <RiMoonLine className="size-5 transition-transform hover:-rotate-12" />
            )}
          </Button>
        }
      />
      <TooltipContent side="bottom">{toggleLabel}</TooltipContent>
    </Tooltip>
  )
}
