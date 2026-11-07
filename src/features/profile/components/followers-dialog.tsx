"use client"

import * as React from "react"
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
import type { FollowerUserItem } from "../types"
import { cn } from "@/lib/utils"

export interface FollowersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: "followers" | "following"
  followersCount?: number
  followingCount?: number
  followersList?: FollowerUserItem[]
  followingList?: FollowerUserItem[]
}

const defaultFollowers: FollowerUserItem[] = [
  {
    id: "f-1",
    username: "rynr_30",
    fullName: "RAFI",
    avatarUrl: "",
    isFollowing: true,
  },
  {
    id: "f-2",
    username: "wildansilki_",
    fullName: "Wildan Silki",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=wildansilki",
    isFollowing: true,
  },
  {
    id: "f-3",
    username: "camilosancruz",
    fullName: "Camilo",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=camilo",
    isFollowing: true,
  },
  {
    id: "f-4",
    username: "keezokutamaa_",
    fullName: "zo",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=keezokutamaa",
    isFollowing: true,
  },
  {
    id: "f-5",
    username: "m.riza.a1",
    fullName: "m.riza.a1",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=riza",
    isFollowing: true,
  },
  {
    id: "f-6",
    username: "abhicidii",
    fullName: "Abhi",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=abhicidii",
    isFollowing: true,
  },
  {
    id: "f-7",
    username: "ndr_rrz",
    fullName: "jendra",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=jendra",
    isFollowing: true,
  },
  {
    id: "f-8",
    username: "mkafi_mln",
    fullName: "mkafi_mln",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=mkafi",
    isFollowing: true,
  },
  {
    id: "f-9",
    username: "_yeonsluv",
    fullName: "Neysa Yuwono",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=neysa",
    isFollowing: true,
  },
]

export function FollowersDialog({
  open,
  onOpenChange,
  defaultTab = "followers",
  followersCount = 9,
  followingCount = 34,
  followersList = defaultFollowers,
  followingList = defaultFollowers,
}: FollowersDialogProps) {
  const [activeTab, setActiveTab] = React.useState<string>(defaultTab)
  const [followingStates, setFollowingStates] = React.useState<
    Record<string, boolean>
  >({})

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setActiveTab(defaultTab)
    }
    onOpenChange(nextOpen)
  }

  const toggleFollow = (userId: string, currentStatus: boolean) => {
    setFollowingStates((prev) => ({
      ...prev,
      [userId]: prev[userId] !== undefined ? !prev[userId] : !currentStatus,
    }))
  }

  const renderUserRow = (user: FollowerUserItem) => {
    const isCurrentlyFollowing =
      followingStates[user.id] !== undefined
        ? followingStates[user.id]
        : !!user.isFollowing

    return (
      <div
        key={user.id}
        className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-3.5 min-w-0">
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

          <div className="flex flex-col min-w-0 leading-tight">
            <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
              {user.username}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
              {user.fullName}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleFollow(user.id, !!user.isFollowing)}
          className={cn(
            "h-9 px-4 rounded-sm font-semibold shrink-0 cursor-pointer transition-colors shadow-xs",
            isCurrentlyFollowing
              ? "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-red-500 dark:hover:text-red-400 bg-transparent"
              : "bg-neutral-900 text-white dark:bg-white dark:text-black border-transparent hover:bg-neutral-800 dark:hover:bg-neutral-200"
          )}
        >
          {isCurrentlyFollowing ? "Following" : "Follow"}
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:max-w-[580px] rounded-lg bg-background text-white border border-neutral-800 pt-4 pb-0 px-0 shadow-2xl overflow-hidden gap-0"
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
          {/* Header 2 Columns with number subtitles */}
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
                  {followersCount}
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
                  {followingCount}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Followers Tab List */}
          <TabsContent
            value="followers"
            className="m-0 bg-accent/30 outline-none max-h-[60vh] overflow-y-auto no-scrollbar divide-y divide-neutral-800 py-1"
          >
            {followersList.map(renderUserRow)}
          </TabsContent>

          {/* Following Tab List */}
          <TabsContent
            value="following"
            className="m-0 bg-accent/30 outline-none max-h-[60vh] overflow-y-auto no-scrollbar divide-y divide-neutral-800 py-1"
          >
            {followingList.map(renderUserRow)}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
