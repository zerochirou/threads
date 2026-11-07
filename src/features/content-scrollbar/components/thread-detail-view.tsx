"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiArrowRightSLine,
  RiArrowUpDownLine,
  RiCheckLine,
  RiExpandDiagonalLine,
  RiFileGifLine,
  RiHeartFill,
  RiImageLine,
  RiRepeatLine,
  RiSendPlaneLine,
} from "@remixicon/react"
import type { ThreadPostItem } from "../types"
import { useThreadDetail } from "../services/threads-service"
import { ThreadAvatar } from "./thread-avatar"
import { ThreadCard } from "./thread-card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ReplyComposerDialog, useComposerMutations } from "@/features/composer"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export interface ThreadDetailViewProps {
  threadId: string
  className?: string
}

export function ThreadDetailView({
  threadId,
  className,
}: ThreadDetailViewProps) {
  const router = useRouter()
  const { data: sessionData } = useSession()
  const replyInputRef = React.useRef<HTMLInputElement>(null)

  const [sortBy, setSortBy] = React.useState<"top" | "recent">("top")
  const {
    post,
    isLoading,
    loadError,
    toggleMainLike,
    toggleReplyLike,
    appendReply,
    removeReply,
  } = useThreadDetail(threadId, sortBy)
  const { createReply } = useComposerMutations()

  const [replyText, setReplyText] = React.useState("")
  const [isSubmittingReply, setIsSubmittingReply] = React.useState(false)
  const [replyError, setReplyError] = React.useState<string | null>(null)
  const [isActivityOpen, setIsActivityOpen] = React.useState(false)
  const [isReplyDialogOpen, setIsReplyDialogOpen] = React.useState(false)

  const handleSortChange = (nextSort: "top" | "recent") => {
    setSortBy(nextSort)
  }

  const submitReply = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!post) return
    const trimmed = replyText.trim()
    if (!trimmed || isSubmittingReply) return

    setReplyError(null)
    setIsSubmittingReply(true)

    const result = await createReply({
      parentThreadId: post.id,
      content: trimmed,
    })

    if (!result.ok) {
      setReplyError(result.error)
      setIsSubmittingReply(false)
      return
    }

    await appendReply(result.reply)
    setReplyText("")
    setIsSubmittingReply(false)
    setIsReplyDialogOpen(false)
  }

  const currentUser = sessionData?.user
  const currentUsername =
    currentUser?.username ||
    currentUser?.email?.split("@")[0]?.toLowerCase() ||
    "zerochirou"
  const currentAvatarUrl =
    currentUser?.image ||
    `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(currentUsername)}`
  const currentFallback = (currentUser?.name || currentUsername)
    .slice(0, 2)
    .toUpperCase()

  const repliesAsPosts: ThreadPostItem[] = (post?.replies ?? []).map(
    (reply) => ({
      id: reply.id,
      author: reply.author,
      timeAgo: reply.timeAgo,
      content: reply.content,
      likeCount: reply.likeCount,
      commentCount: reply.commentCount,
      repostCount: reply.repostCount,
      shareCount: reply.shareCount,
      isLiked: reply.isLiked,
      linkPreview: reply.linkPreview,
      parentThreadId: reply.parentThreadId,
    })
  )

  return (
    <ScrollArea
      className={cn(
        "h-dvh w-full max-w-[668px] mx-auto px-0 md:px-4 pt-1 md:py-4",
        "no-scrollbar **:data-[slot=scroll-area-scrollbar]:hidden **:data-[slot=scroll-area-viewport]:no-scrollbar",
        className,
      )}
    >
      <div className="flex flex-col gap-1.5 md:gap-3 pb-24">
        <header className="flex items-center justify-between px-3 md:px-2 pt-1.5 pb-1">
          <div className="flex items-center gap-3.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="size-8 rounded-full text-foreground hover:bg-neutral-200/60 dark:hover:bg-neutral-800/70 cursor-pointer"
              aria-label="Back"
            >
              <RiArrowLeftLine className="size-5" />
            </Button>

            <div className="flex flex-col">
              <h1 className="text-[16px] font-bold text-foreground leading-tight">
                Thread
              </h1>
              {post?.viewsCount && (
                <span className="text-[12px] text-muted-foreground leading-tight">
                  {post.viewsCount}
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full cursor-pointer"
                  aria-label="Thread options"
                >
                  <Image
                    src="/assets/icons/more.svg"
                    alt="More options"
                    width={20}
                    height={20}
                    className="size-5 object-contain dark:invert"
                  />
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-sm p-1.5 shadow-xl bg-accent"
            >
              <DropdownMenuItem
                className="rounded-lg cursor-pointer"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard?.writeText(window.location.href);
                  }
                }}
              >
                Copy thread link
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg cursor-pointer"
                onClick={() => setIsActivityOpen(true)}
              >
                View thread activity
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="w-full py-2 md:rounded-2xl border-y md:border border-neutral-200/90 dark:border-neutral-800/90 text-card-foreground shadow-xs overflow-hidden divide-y divide-neutral-200/80 dark:divide-neutral-800/80">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Loading thread...
            </div>
          ) : loadError || !post ? (
            <div className="p-12 flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">
                {loadError || "Thread not found."}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/")}
                className="rounded-full cursor-pointer"
              >
                Back to feed
              </Button>
            </div>
          ) : (
            <>
              <ThreadCard
                post={post}
                isDetailMain
                onToggleLike={toggleMainLike}
                onCommentClick={() => replyInputRef.current?.focus()}
              />

              <div className="px-4.5 py-3 text-xs">
                <div className="flex items-center justify-between">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          <RiArrowUpDownLine className="size-3.5 text-muted-foreground" />
                          <span>{sortBy === "top" ? "Top" : "Recent"}</span>
                          <RiArrowDownSLine className="size-3.5 text-muted-foreground" />
                        </button>
                      }
                    />
                    <DropdownMenuContent
                      align="start"
                      className="w-36 rounded-xl p-1 shadow-xl"
                    >
                      <DropdownMenuItem
                        onClick={() => handleSortChange("top")}
                        className="flex items-center justify-between rounded-lg cursor-pointer font-medium"
                      >
                        <span>Top</span>
                        {sortBy === "top" && <RiCheckLine className="size-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSortChange("recent")}
                        className="flex items-center justify-between rounded-lg cursor-pointer font-medium"
                      >
                        <span>Recent</span>
                        {sortBy === "recent" && (
                          <RiCheckLine className="size-4" />
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <button
                    type="button"
                    onClick={() => setIsActivityOpen(true)}
                    className="inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium"
                  >
                    <span>View activity</span>
                    <RiArrowRightSLine className="size-4" />
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <form
                    onSubmit={submitReply}
                    className="flex items-center gap-3 rounded-full bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-800 px-1.5 py-1.5"
                  >
                    <ThreadAvatar
                      src={currentAvatarUrl}
                      alt={currentUsername}
                      fallback={currentFallback}
                      size="default"
                    />

                    <input
                      ref={replyInputRef}
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${post.author.username}...`}
                      disabled={isSubmittingReply}
                      aria-label={`Reply to ${post.author.username}`}
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
                    />

                    <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                      {replyText.trim().length > 0 ? (
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isSubmittingReply}
                          className="h-7 rounded-full px-3 text-xs font-semibold cursor-pointer"
                        >
                          {isSubmittingReply ? "Posting..." : "Reply"}
                        </Button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => setIsReplyDialogOpen(true)}
                        className="p-1 rounded-full hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Add image to reply"
                      >
                        <RiImageLine className="size-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsReplyDialogOpen(true)}
                        className="p-1 rounded-full hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Add GIF to reply"
                      >
                        <RiFileGifLine className="size-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsReplyDialogOpen(true)}
                        className="p-1 rounded-full hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Expand reply composer"
                      >
                        <RiExpandDiagonalLine className="size-[17px]" />
                      </button>
                    </div>
                  </form>

                  {replyError && (
                    <p className="text-xs text-red-500 dark:text-red-400 pl-3">
                      {replyError}
                    </p>
                  )}
                </div>
              </div>

              {repliesAsPosts.length > 0 ? (
                <div className="divide-y divide-neutral-200/80 dark:divide-neutral-800/80">
                  {repliesAsPosts.map((replyPost) => (
                    <ThreadCard
                      key={replyPost.id}
                      post={replyPost}
                      onToggleLike={toggleReplyLike}
                      onDeleted={removeReply}
                      showTranslateButton={
                        replyPost.author.username === "miqdadbadjuber"
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  No replies yet. Start the conversation above.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={isActivityOpen} onOpenChange={setIsActivityOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card border-neutral-200 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Post activity
            </DialogTitle>
            <DialogDescription>
              {post?.viewsCount ?? "6K views"} across Threads
            </DialogDescription>
          </DialogHeader>

          {post && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between py-2.5 border-b border-neutral-200/70 dark:border-neutral-800">
                <span className="flex items-center gap-2.5 text-sm font-medium">
                  <RiHeartFill className="size-4 text-rose-500" />
                  Likes
                </span>
                <span className="text-sm font-bold">{post.likeCount}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-neutral-200/70 dark:border-neutral-800">
                <span className="flex items-center gap-2.5 text-sm font-medium">
                  <RiRepeatLine className="size-4 text-foreground/80" />
                  Reposts
                </span>
                <span className="text-sm font-bold">
                  {post.repostCount ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2.5 text-sm font-medium">
                  <RiSendPlaneLine className="size-4 text-foreground/80" />
                  Shares
                </span>
                <span className="text-sm font-bold">
                  {post.shareCount ?? 0}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {post && (
        <ReplyComposerDialog
          open={isReplyDialogOpen}
          onOpenChange={setIsReplyDialogOpen}
          parentPost={post}
          onReplySuccess={(createdReply) => {
            void appendReply(createdReply)
          }}
        />
      )}
    </ScrollArea>
  );
}
