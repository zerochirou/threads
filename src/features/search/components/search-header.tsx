"use client";

import * as React from "react";
import { RiSearchLine, RiEqualizer2Line, RiMoreFill } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface SearchHeaderProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick?: () => void;
  className?: string;
}

export function SearchHeader({
  value,
  onChange,
  onFilterClick,
  className,
}: SearchHeaderProps) {
  return (
    <div className={cn("flex items-center gap-2 pt-2 pb-4", className)}>
      {/* Search Input Bar with Filter icon inside */}
      <div className="flex-1 relative flex bg-accent/70 items-center h-11 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 px-4 group focus-within:border-neutral-400 dark:focus-within:border-neutral-600 transition-colors">
        <RiSearchLine className="size-4.5 text-neutral-400 group-focus-within:text-neutral-900 dark:group-focus-within:text-white shrink-0 mr-3 transition-colors" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search"
          className="flex-1 bg-transparent text-[15px] text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none border-0 p-0 focus:ring-0"
        />
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={onFilterClick}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer p-1"
                aria-label="Filter search"
              >
                <RiEqualizer2Line className="size-4.5" />
              </button>
            }
          />
          <TooltipContent side="bottom">Filters</TooltipContent>
        </Tooltip>
      </div>

      {/* More Options Button */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="Feed options"
                  >
                    <Image
                      src="/assets/icons/more.svg"
                      alt="Feed options"
                      width={20}
                      height={20}
                      className="size-5 object-contain dark:invert"
                    />
                  </Button>
                }
              />
            }
          />
          <TooltipContent side="bottom">More</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="cursor-pointer">
            Search settings
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            Clear search history
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
