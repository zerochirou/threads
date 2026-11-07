"use client"

import * as React from "react"
import { RiMoreLine, RiVerifiedBadgeFill } from "@remixicon/react"
import type { ThreadPostItem } from "../types"
import { ThreadAvatar } from "./thread-avatar"
import { ThreadActions } from "./thread-actions"
import { ThreadPreviewCard } from "./thread-preview-card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface ThreadCardProps {
  post: ThreadPostItem
  onToggleLike?: (postId: string) => void
  className?: string
}

export function ThreadCard({ post, onToggleLike, className }: ThreadCardProps) {
  return (
    <article className={cn("px-6 py-4 flex gap-3.5", className)}>
      <div className="flex flex-col items-center">
        <ThreadAvatar
          src={post.author.avatarUrl}
          alt={post.author.username}
          fallback={post.author.fallback}
          hasFollowBadge={post.author.hasFollowBadge}
        />
      </div>

      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        {/* Post Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm text-foreground hover:underline cursor-pointer">
              {post.author.username}
            </span>
            {post.author.verified && (
              <RiVerifiedBadgeFill className="size-3.5 text-foreground/80" />
            )}
            <span className="text-xs text-muted-foreground">
              {post.timeAgo}
            </span>
            {post.author.badges?.map((badge, idx) => (
              <React.Fragment key={idx}>{badge}</React.Fragment>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer -mr-1"
                  aria-label="Post actions"
                >
                  <RiMoreLine className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-xl p-1 shadow-lg"
            >
              <DropdownMenuItem className="cursor-pointer">
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Mute author
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive">
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Content */}
        <div className="text-[14px] leading-relaxed text-foreground/95 flex flex-col gap-3 font-normal">
          {post.content}
        </div>

        {/* Media / Link Preview (Optional) */}
        {post.linkPreview && <ThreadPreviewCard preview={post.linkPreview} />}

        {/* Post Action Buttons */}
        <ThreadActions
          likeCount={post.likeCount}
          commentCount={post.commentCount}
          repostCount={post.repostCount}
          shareCount={post.shareCount}
          isLiked={post.isLiked}
          onToggleLike={() => onToggleLike?.(post.id)}
        />
      </div>
    </article>
  );
}
