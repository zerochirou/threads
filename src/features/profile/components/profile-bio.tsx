"use client"

import * as React from "react"
import Image from "next/image"
import { RiLockLine, RiVerifiedBadgeFill } from "@remixicon/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { ProfileUser } from "../types"
import { cn } from "@/lib/utils"

export interface ProfileBioProps {
  user: ProfileUser
  onEditProfile?: () => void
  onViewInsights?: () => void
  onFollowersClick?: () => void
  onToggleFollow?: () => void
  isFollowing?: boolean
  className?: string
}

export function ProfileBio({
  user,
  onEditProfile,
  onFollowersClick,
  onToggleFollow,
  isFollowing = false,
  className,
}: ProfileBioProps) {
  return (
    <div className={cn("px-4 sm:px-6 pt-2 pb-4 sm:pb-5 flex flex-col gap-3.5 sm:gap-4", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white truncate">
              {user.name}
            </h1>
            {user.verified && (
              <RiVerifiedBadgeFill
                className="size-5 text-[#0095f6] shrink-0"
                aria-label="Verified account"
              />
            )}
            {user.isPrivate && (
              <RiLockLine
                className="size-4 text-neutral-500 dark:text-neutral-400 shrink-0"
                aria-label="Private account"
              />
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[15px] font-normal text-neutral-600 dark:text-neutral-300 truncate">
              {user.username}
            </p>
            <span className="inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              threads.net
            </span>
          </div>
        </div>

        <Avatar className="size-16 sm:size-20 md:size-22 rounded-full border border-neutral-200/80 dark:border-neutral-800 shadow-xs shrink-0 overflow-hidden">
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

      {/* Interests / Communities */}
      {user.communities && user.communities.length > 0 && (
        <div className="flex items-center flex-wrap gap-1.5">
          {user.communities.map((community) => (
            <span
              key={community}
              className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              {community}
            </span>
          ))}
        </div>
      )}

      {/* External Link / Podcast Link */}
      {(user.link || user.podcastUrl) && (
        <div className="flex items-center flex-wrap gap-3 text-sm font-semibold text-neutral-900 dark:text-white">
          {user.link && (
            <a
              href={user.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1 text-[#0095f6]"
            >
              {user.link.label}
            </a>
          )}
          {user.podcastUrl && (
            <a
              href={user.podcastUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1 text-[#0095f6]"
            >
              {user.podcastUrl.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      )}

      {/* Follower Stats with mini stacked avatars */}
      <button
        type="button"
        onClick={onFollowersClick}
        className="flex items-center gap-2 pt-0.5 text-sm text-neutral-500 dark:text-neutral-400 hover:underline cursor-pointer w-fit text-left"
      >
        {user.followerAvatars && user.followerAvatars.length > 0 && (
          <div className="flex -space-x-1.5 overflow-hidden py-0.5">
            {user.followerAvatars.map((avatar, idx) => (
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
        )}
        <span>{user.followersCount.toLocaleString()} followers</span>
      </button>

      {/* Action Buttons: If self -> Edit Profile & View insights; If other user -> Follow Button */}
      {user.isSelf ? (
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
            onClick={onFollowersClick}
            className="h-9 rounded-md border-neutral-200 dark:border-neutral-800 dark:bg-background dark:hover:bg-neutral-800 font-semibold text-sm hover:text-foreground cursor-pointer shadow-xs"
          >
            View followers
          </Button>
        </div>
      ) : (
        <div className="pt-1">
          <Button
            onClick={onToggleFollow}
            className={cn(
              "w-full h-9 rounded-md font-semibold text-sm cursor-pointer shadow-xs transition-colors",
              isFollowing
                ? "bg-transparent border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200",
            )}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>
      )}
    </div>
  );
}

