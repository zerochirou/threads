"use client"

import * as React from "react"
import Link from "next/link"
import { RiUserLine, RiVerifiedBadgeFill } from "@remixicon/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { SearchUserItem } from "../types"
import { cn } from "@/lib/utils"

export interface SearchResultItemProps {
  user: SearchUserItem
  onToggleFollow?: (id: string) => void
  className?: string
}

export function SearchResultItem({
  user,
  onToggleFollow,
  className,
}: SearchResultItemProps) {
  const [isFollowing, setIsFollowing] = React.useState(!!user.isFollowing)
  const handleToggle = () => {
    setIsFollowing(!isFollowing)
    onToggleFollow?.(user.id)
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3.5 px-4 sm:px-6 py-3.5 sm:py-4 hover:bg-neutral-50/50 dark:hover:bg-white/[0.02] transition-colors",
        className,
      )}
    >
      {/* Avatar Link */}
      <Link href={`/profile/${user.username}`}>
        <Avatar className="size-10 rounded-full border border-neutral-200/80 dark:border-neutral-800 shrink-0 bg-neutral-800 cursor-pointer hover:opacity-90 transition-opacity">
          {user.avatarUrl ? (
            <AvatarImage
              src={user.avatarUrl}
              alt={user.username}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-neutral-800 text-xs font-semibold text-white">
            {user.fallback}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* Info Column */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Username + verified badge & Follow button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link
                href={`/profile/${user.username}`}
                className="font-bold text-[15px] text-neutral-900 dark:text-white truncate cursor-pointer hover:underline"
              >
                {user.username}
              </Link>
              {user.verified && (
                <RiVerifiedBadgeFill className="size-4 text-[#0095f6] shrink-0" />
              )}
            </div>
            <Link
              href={`/profile/${user.username}`}
              className="text-xs text-neutral-500 dark:text-neutral-400 font-normal truncate hover:underline"
            >
              {user.fullName}
            </Link>
          </div>

          {!user.isSelf && (
            <Button
              size="lg"
              variant={"secondary"}
              onClick={handleToggle}
              className={cn(
                "rounded-sm px-5 h-9 font-semibold transition-colors cursor-pointer shrink-0 shadow-xs",
                isFollowing
                  ? "bg-transparent border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                  : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200",
              )}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        {/* Bio text */}
        {user.bio && (
          <p className="text-sm text-neutral-700 dark:text-[#e7e9eb] font-normal leading-relaxed break-words pt-0.5">
            {user.bio}
          </p>
        )}

        {/* Followers info line */}
        {user.followersCountText && (
          <div className="flex items-center gap-1.5 pt-1 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="size-3.5 rounded-full overflow-hidden flex items-center justify-center text-[8px]">
              <RiUserLine />
            </div>
            <span>{user.followersCountText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
