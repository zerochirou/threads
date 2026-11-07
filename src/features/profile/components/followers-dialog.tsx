"use client"

import * as React from "react"
import Link from "next/link"
import { RiVerifiedBadgeFill } from "@remixicon/react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useProfileConnections } from "../services/profile-service"
import type { FollowerUserItem } from "../types"
import { cn } from "@/lib/utils"

export interface FollowersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  username?: string
  defaultTab?: "followers" | "following"
  followersCount?: number
  followingCount?: number
  followersList?: FollowerUserItem[]
  followingList?: FollowerUserItem[]
}

export function FollowersDialog({
  open,
  onOpenChange,
  username,
  defaultTab = "followers",
  followersCount = 0,
  followingCount = 0,
  followersList: initialFollowersList,
  followingList: initialFollowingList,
}: FollowersDialogProps) {
  const [activeTab, setActiveTab] = React.useState<string>(defaultTab)
  const {
    followers,
    following,
    followersCount: liveFollowersCount,
    followingCount: liveFollowingCount,
    isLoading,
    toggleFollowInList,
  } = useProfileConnections({
    username,
    enabled: open && Boolean(username),
  })

  const resolvedFollowers =
    followers.length > 0 || !initialFollowersList
      ? followers
      : initialFollowersList
  const resolvedFollowing =
    following.length > 0 || !initialFollowingList
      ? following
      : initialFollowingList

  const displayFollowersCount =
    typeof liveFollowersCount === "number" ? liveFollowersCount : followersCount
  const displayFollowingCount =
    typeof liveFollowingCount === "number" ? liveFollowingCount : followingCount

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setActiveTab(defaultTab)
    }
    onOpenChange(nextOpen)
  }

  const renderUserRow = (user: FollowerUserItem) => {
    const isCurrentlyFollowing = Boolean(user.isFollowing)

    return (
      <div
        key={user.id}
        className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            href={`/profile/${user.username}`}
            onClick={() => onOpenChange(false)}
          >
            <Avatar className="size-10 rounded-full border border-neutral-700/60 bg-neutral-800 shrink-0">
              {user.avatarUrl ? (
                <AvatarImage
                  src={user.avatarUrl}
                  alt={user.username}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-neutral-800 text-xs font-semibold text-neutral-300">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex flex-col min-w-0 leading-tight">
            <div className="flex items-center gap-1 min-w-0">
              <Link
                href={`/profile/${user.username}`}
                onClick={() => onOpenChange(false)}
                className="font-semibold text-sm text-neutral-900 dark:text-white hover:underline truncate"
              >
                {user.username}
              </Link>
              {user.verified && (
                <RiVerifiedBadgeFill className="size-3.5 text-sky-500 shrink-0" />
              )}
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
              {user.fullName}
            </span>
          </div>
        </div>

        {!user.isSelf && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void toggleFollowInList(user.id)}
            className={cn(
              "h-9 px-4 rounded-sm font-semibold shrink-0 cursor-pointer transition-colors shadow-xs",
              isCurrentlyFollowing
                ? "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-red-500 dark:hover:text-red-400 bg-transparent"
                : "bg-neutral-900 text-white dark:bg-white dark:text-black border-transparent hover:bg-neutral-800 dark:hover:bg-neutral-200"
            )}
          >
            {isCurrentlyFollowing ? "Following" : "Follow"}
          </Button>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-1.5rem)] sm:max-w-[580px] rounded-2xl bg-background text-white border border-neutral-800 pt-4 pb-0 px-0 shadow-2xl overflow-hidden gap-0"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Followers and Following</DialogTitle>
          <DialogDescription>
            View people who follow this account or accounts followed by this
            user.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full gap-0"
        >
          <div className="border-b border-neutral-800">
            <TabsList
              variant="line"
              className="w-full h-14 p-0 justify-around rounded-none bg-transparent"
            >
              <TabsTrigger
                value="followers"
                className="flex-1 pb-4 h-full flex flex-col items-center justify-center gap-0.5 rounded-none cursor-pointer after:bottom-0 after:h-[1.5px] data-active:text-white text-neutral-400"
              >
                <span className="font-bold text-sm leading-none">
                  Followers
                </span>
                <span className="text-xs font-normal text-neutral-400 leading-none">
                  {displayFollowersCount}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="following"
                className="flex-1 pb-4 h-full flex flex-col items-center justify-center gap-0.5 rounded-none cursor-pointer after:bottom-0 after:h-[1.5px] data-active:text-white text-neutral-400"
              >
                <span className="font-bold text-sm leading-none">
                  Following
                </span>
                <span className="text-xs font-normal text-neutral-400 leading-none">
                  {displayFollowingCount}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="followers"
            className="m-0 bg-accent/30 outline-none max-h-[60vh] overflow-y-auto no-scrollbar divide-y divide-neutral-800 py-1"
          >
            {isLoading && resolvedFollowers.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-400 animate-pulse">
                Loading followers...
              </div>
            ) : resolvedFollowers.length > 0 ? (
              resolvedFollowers.map(renderUserRow)
            ) : (
              <div className="p-8 text-center text-sm text-neutral-400">
                No followers yet.
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="following"
            className="m-0 bg-accent/30 outline-none max-h-[60vh] overflow-y-auto no-scrollbar divide-y divide-neutral-800 py-1"
          >
            {isLoading && resolvedFollowing.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-400 animate-pulse">
                Loading following...
              </div>
            ) : resolvedFollowing.length > 0 ? (
              resolvedFollowing.map(renderUserRow)
            ) : (
              <div className="p-8 text-center text-sm text-neutral-400">
                Not following anyone yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
