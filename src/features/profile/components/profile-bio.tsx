"use client"

import * as React from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { ProfileUser } from "../types"
import { cn } from "@/lib/utils"

export interface ProfileBioProps {
  user: ProfileUser
  onEditProfile?: () => void
  onViewInsights?: () => void
  onFollowersClick?: () => void
  className?: string
}

export function ProfileBio({
  user,
  onEditProfile,
  onViewInsights,
  onFollowersClick,
  className,
}: ProfileBioProps) {
  return (
    <div className={cn("px-6 pt-2 pb-5 flex flex-col gap-4", className)}>
      {/* Top Section: Names on left, Avatar on right */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {user.name}
          </h1>
          <p className="text-[15px] font-normal">
            {user.username}
          </p>
        </div>

        <Avatar className="size-20 sm:size-22 rounded-full border border-neutral-200/80 dark:border-neutral-800 shadow-xs shrink-0 overflow-hidden">
          <AvatarImage
            src={user.avatarUrl}
            alt={user.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-neutral-800 text-lg font-bold text-white">
            {user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Bio text */}
      {user.bio && (
        <p className="text-[15px] leading-relaxed text-neutral-800 dark:text-[#e7e9eb] font-normal whitespace-pre-wrap">
          {user.bio}
        </p>
      )}

      {/* External Link */}
      {user.link && (
        <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white">
          <a
            href={user.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1"
          >
            {user.link.label}
          </a>
        </div>
      )}

       {/* Follower Stats with mini stacked avatars */}
      <button
        type="button"
        onClick={onFollowersClick}
        className="flex items-center gap-2 pt-0.5 text-sm text-neutral-500 dark:text-neutral-400 hover:underline cursor-pointer w-fit text-left"
      >
        <div className="flex -space-x-1.5 overflow-hidden py-0.5">
          {(user.followerAvatars || [
            "https://api.dicebear.com/9.x/avataaars/svg?seed=follower1",
            "https://api.dicebear.com/9.x/avataaars/svg?seed=follower2",
          ]).map((avatar, idx) => (
            <div
              key={idx}
              className="relative size-4.5 rounded-full ring-2 ring-background bg-neutral-700 overflow-hidden shrink-0"
            >
              <Image
                src={avatar}
                alt="follower"
                fill
                sizes="18px"
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
        <span>{user.followersCount.toLocaleString()} followers</span>
      </button>

      {/* Action Buttons: Edit profile & View insights */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button
          variant="outline"
          onClick={onEditProfile}
          className="h-9 rounded-md border-neutral-200 dark:border-neutral-800 dark:bg-background dark:hover:bg-neutral-800 font-semibold text-sm hover:text-foreground cursor-pointer shadow-xs"
        >
          Edit profile
        </Button>
        <Button
          variant="outline"
          onClick={onViewInsights}
          className="h-9 rounded-md border-neutral-200 dark:border-neutral-800 dark:bg-background dark:hover:bg-neutral-800 font-semibold text-sm hover:text-foreground cursor-pointer shadow-xs"
        >
          View insights
        </Button>
      </div>
    </div>
  )
}
