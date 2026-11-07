"use client"

import * as React from "react"
import { RiAddLine } from "@remixicon/react"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface ThreadAvatarProps {
  src?: string
  alt: string
  fallback: string
  hasFollowBadge?: boolean
  className?: string
  size?: "default" | "sm" | "lg"
}

export function ThreadAvatar({
  src,
  alt,
  fallback,
  hasFollowBadge = false,
  className,
  size = "default",
}: ThreadAvatarProps) {
  return (
    <Avatar size={size} className={cn("ring-1 ring-border relative shrink-0", className)}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback className="bg-neutral-800 text-xs font-semibold text-white">
        {fallback}
      </AvatarFallback>
      {hasFollowBadge && (
        <AvatarBadge className="bg-foreground text-background ring-2 ring-card size-3.5 p-0 flex items-center justify-center">
          <RiAddLine className="size-2.5 stroke-[2]" />
        </AvatarBadge>
      )}
    </Avatar>
  )
}
