"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { RiBookmarkLine, RiHeartLine, RiThreadsFill } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface FeedHeaderProps {
  title?: string
  showMobileLogo?: boolean
  className?: string
}

export function FeedHeader({
  title = "For you",
  showMobileLogo = false,
  className,
}: FeedHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 md:px-2 pt-2.5 md:pt-1 pb-1.5 md:pb-0.5",
        className
      )}
    >
      {showMobileLogo ? (
        <>
          <div className="w-9 md:hidden" aria-hidden="true" />
          <Link
            href="/"
            aria-label="Threads Home"
            className="md:hidden flex items-center justify-center text-foreground hover:opacity-90 transition-opacity"
          >
            <RiThreadsFill className="size-8" />
          </Link>
          <h1 className="hidden md:block text-lg font-bold text-foreground tracking-tight">
            {title}
          </h1>
        </>
      ) : (
        <h1 className="text-2xl md:text-lg font-bold text-foreground tracking-tight">
          {title}
        </h1>
      )}

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-full cursor-pointer"
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
          <DropdownMenuContent
            align="end"
            className="w-52 rounded-xl p-1.5 shadow-xl bg-accent"
          >
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={<Link href="/" className="rounded-lg cursor-pointer" />}
              >
                For you
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <Link
                    href="/?feed=following"
                    className="rounded-lg cursor-pointer"
                  />
                }
              >
                Following
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={
                  <Link
                    href="/saved"
                    className="flex items-center gap-2 rounded-lg cursor-pointer"
                  />
                }
              >
                <RiBookmarkLine className="size-4" />
                <span>Saved threads</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <Link
                    href="/liked"
                    className="flex items-center gap-2 rounded-lg cursor-pointer"
                  />
                }
              >
                <RiHeartLine className="size-4" />
                <span>Liked threads</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
