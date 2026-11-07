"use client"

import * as React from "react"
import { RiSearchLine } from "@remixicon/react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface SearchBarProps {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <RiSearchLine className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground  " />
      <Input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-10 w-full rounded-2xl border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100 dark:bg-neutral-900/80 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-border transition-colors"
      />
    </div>
  )
}
