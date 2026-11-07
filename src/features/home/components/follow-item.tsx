"use client"

import * as React from "react"
import { RiVerifiedBadgeFill } from "@remixicon/react"
import type { FollowSuggestion } from "../types"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface FollowItemProps {
  suggestion: FollowSuggestion
  onToggleFollow?: (id: string) => void
  className?: string
}

export function FollowItem({
  suggestion,
  onToggleFollow,
  className,
}: FollowItemProps) {
  return (
    <div className={cn("flex items-start gap-3 py-3 select-none", className)}>
      {/* Avatar */}
      <Avatar size="default" className="size-10 shrink-0 ring-1 ring-border/80">
        <AvatarImage src={suggestion.avatarUrl} alt={suggestion.username} />
        <AvatarFallback className="bg-neutral-800 text-xs font-semibold text-white">
          {suggestion.fallback}
        </AvatarFallback>
      </Avatar>

      {/* Info & Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {/* Name & Follow Button Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-semibold text-sm text-foreground hover:underline cursor-pointer truncate">
              {suggestion.username}
            </span>
            {suggestion.verified && (
              <RiVerifiedBadgeFill className="size-3.5 text-sky-500 shrink-0" />
            )}
          </div>

          <Button
            size="sm"
            variant={suggestion.isFollowing ? "secondary" : "outline"}
            onClick={() => onToggleFollow?.(suggestion.id)}
            className={cn(
              "h-8 rounded-xl px-4 text-xs font-semibold transition-all cursor-pointer shrink-0",
              suggestion.isFollowing
                ? "text-muted-foreground hover:text-foreground"
                : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground"
            )}
          >
            {suggestion.isFollowing ? "Following" : "Follow"}
          </Button>
        </div>

        {/* Subtitle / Display Name */}
        {suggestion.displayName && (
          <p className="text-xs text-muted-foreground truncate">
            {suggestion.displayName}
          </p>
        )}

        {/* Bio */}
        <p className="text-xs text-foreground/80 leading-snug line-clamp-2 mt-0.5">
          {suggestion.bio}
        </p>

        {/* Followers row */}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
          {suggestion.mutualFollowers && suggestion.mutualFollowers.length > 0 && (
            <div className="flex -space-x-1.5 items-center">
              {suggestion.mutualFollowers.map((follower, idx) => (
                <Avatar key={idx} className="size-3.5 ring-1 ring-background">
                  <AvatarImage src={follower.avatarUrl} alt={follower.alt} />
                  <AvatarFallback className="text-[7px]">
                    {follower.fallback ?? "U"}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
          <span className="text-[11px] font-medium">{suggestion.followersCount}</span>
        </div>
      </div>
    </div>
  )
}
