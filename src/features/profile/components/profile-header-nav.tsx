"use client";

import * as React from "react";
import { RiSearchLine, RiMoreFill } from "@remixicon/react";
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

export interface ProfileHeaderNavProps {
  username?: string;
  className?: string;
}

export function ProfileHeaderNav({
  username = "zerochirou",
  className,
}: ProfileHeaderNavProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 sm:px-4 py-2",
        className,
      )}
    >
      <span className="text-xl sm:text-lg font-semibold text-neutral-900 dark:text-white">
        {username}
      </span>

      <div className="flex items-center gap-1">
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
            <TooltipContent side="bottom">More options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer">
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              About this profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
