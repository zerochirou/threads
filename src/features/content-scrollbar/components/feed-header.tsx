"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import Image from "next/image"

export interface FeedHeaderProps {
  title?: string
  className?: string
}

export function FeedHeader({ title = "For you", className }: FeedHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-2 pt-1 pb-0.5", className)}>
      <h1 className="text-lg font-bold text-foreground tracking-tight">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <DropdownMenu>
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
          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 shadow-xl">
            <DropdownMenuGroup>
              <DropdownMenuItem className="rounded-lg cursor-pointer">
                Manage feeds
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer">
                Hide posts from muted accounts
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
