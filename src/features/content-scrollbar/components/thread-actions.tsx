"use client"

import * as React from "react"
import {
  RiChat3Line,
  RiHeartFill,
  RiHeartLine,
  RiRepeatLine,
  RiSendPlaneLine,
} from "@remixicon/react"
import { cn } from "@/lib/utils"

export interface ThreadActionsProps {
  likeCount: number
  commentCount?: number
  repostCount?: number
  shareCount?: number
  isLiked?: boolean
  onToggleLike?: () => void
  onCommentClick?: () => void
  className?: string
}

export function ThreadActions({
  likeCount,
  commentCount,
  repostCount,
  shareCount,
  isLiked = false,
  onToggleLike,
  onCommentClick,
  className,
}: ThreadActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 pt-1.5 -ml-2 text-muted-foreground",
        className
      )}
    >
      <button
        type="button"
        onClick={onToggleLike}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 min-h-9 min-w-9 px-2 rounded-full text-xs hover:text-foreground hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 active:scale-95 transition-all cursor-pointer group",
          isLiked && "text-rose-500 hover:text-rose-600"
        )}
        aria-label="Like post"
      >
        {isLiked ? (
          <RiHeartFill className="size-[19px] text-rose-500 group-hover:scale-110 transition-transform" />
        ) : (
          <RiHeartLine className="size-[19px] group-hover:scale-110 transition-transform" />
        )}
        {likeCount > 0 && <span>{likeCount}</span>}
      </button>

      <button
        type="button"
        onClick={onCommentClick}
        className="inline-flex items-center justify-center gap-1.5 min-h-9 min-w-9 px-2 rounded-full text-xs hover:text-foreground hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 active:scale-95 transition-all cursor-pointer group"
        aria-label="Comment"
      >
        <RiChat3Line className="size-[19px] group-hover:scale-110 transition-transform" />
        {commentCount !== undefined && commentCount > 0 && (
          <span>{commentCount}</span>
        )}
      </button>

      <button
        type="button"
        className="inline-flex items-center justify-center gap-1.5 min-h-9 min-w-9 px-2 rounded-full text-xs hover:text-foreground hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 active:scale-95 transition-all cursor-pointer group"
        aria-label="Repost"
      >
        <RiRepeatLine className="size-[19px] group-hover:scale-110 transition-transform" />
        {repostCount !== undefined && repostCount > 0 && (
          <span>{repostCount}</span>
        )}
      </button>

      <button
        type="button"
        className="inline-flex items-center justify-center gap-1.5 min-h-9 min-w-9 px-2 rounded-full text-xs hover:text-foreground hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 active:scale-95 transition-all cursor-pointer group"
        aria-label="Share"
      >
        <RiSendPlaneLine className="size-[19px] group-hover:scale-110 transition-transform" />
        {shareCount !== undefined && shareCount > 0 && <span>{shareCount}</span>}
      </button>
    </div>
  )
}
