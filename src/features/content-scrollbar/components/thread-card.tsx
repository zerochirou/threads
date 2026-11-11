"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  RiBookmarkFill,
  RiBookmarkLine,
  RiDeleteBinLine,
  RiMoreLine,
  RiVerifiedBadgeFill,
} from "@remixicon/react"
import type { ThreadPostItem, ThreadReplyItem } from "../types"
import {
  deleteThreadRequest,
  prefetchThreadDetail,
  toggleThreadSaveRequest,
} from "../services/threads-service"
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export interface ThreadCardProps {
  post: ThreadPostItem
  onToggleLike?: (postId: string) => void
  onToggleSave?: (postId: string, saved: boolean) => void
  onReplyAdded?: (postId: string, reply: ThreadReplyItem) => void
  onCommentClick?: (postId: string) => void
  onDeleted?: (postId: string) => void
  isDetailMain?: boolean
  showTranslateButton?: boolean
  className?: string
}

function renderFormattedText(
  text: string,
  showTranslateButton?: boolean
): React.ReactNode {
  const paragraphs = text.split(/\n\n+/)
  const urlRegex = /\b(antislop\.ai\.id|style\.ai\.id|https?:\/\/[^\s]+)\b/g

  return paragraphs.map((paragraph, pIdx) => {
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = urlRegex.exec(paragraph)) !== null) {
      if (match.index > lastIndex) {
        parts.push(paragraph.slice(lastIndex, match.index))
      }
      const matchedText = match[0]
      const rawHref = matchedText.startsWith("http")
        ? matchedText
        : `https://${matchedText}`
      let safeHref: string | null = null
      try {
        const parsed = new URL(rawHref)
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          safeHref = parsed.toString()
        }
      } catch {
        safeHref = null
      }
      if (safeHref) {
        parts.push(
          <Link
            key={`${pIdx}-${match.index}`}
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sky-500 hover:underline font-medium"
          >
            {matchedText}
          </Link>
        )
      } else {
        parts.push(matchedText)
      }
      lastIndex = match.index + matchedText.length
    }

    if (lastIndex < paragraph.length) {
      parts.push(paragraph.slice(lastIndex))
    }

    const isLast = pIdx === paragraphs.length - 1

    return (
      <p key={pIdx} className="whitespace-pre-wrap">
        {parts}
        {isLast && showTranslateButton && (
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:underline text-xs cursor-pointer inline-block ml-1.5"
          >
            Translate
          </button>
        )}
      </p>
    )
  })
}

export function ThreadCard({
  post,
  onToggleLike,
  onToggleSave,
  onCommentClick,
  onDeleted,
  isDetailMain = false,
  showTranslateButton = false,
  className,
}: ThreadCardProps) {
  const router = useRouter()
  const { data: sessionData } = useSession()
  const [savedOverride, setSavedOverride] = React.useState<boolean | null>(null)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const isSaved = savedOverride !== null ? savedOverride : Boolean(post.isSaved)

  const isOwner = Boolean(
    sessionData?.user &&
      ((post.author.id && sessionData.user.id === post.author.id) ||
        (post.author.username && sessionData.user.username === post.author.username))
  )

  const handleToggleSave = async () => {
    const nextState = !isSaved
    setSavedOverride(nextState)
    onToggleSave?.(post.id, nextState)

    try {
      const data = await toggleThreadSaveRequest(post.id)
      if (data && typeof data.saved === "boolean") {
        setSavedOverride(data.saved)
        onToggleSave?.(post.id, data.saved)
      }
    } catch {
      setSavedOverride(!nextState)
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    const result = await deleteThreadRequest(post.id)
    setIsDeleting(false)
    if (result.success) {
      setIsConfirmDeleteOpen(false)
      onDeleted?.(post.id)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("threads:thread-deleted", {
            detail: {
              threadId: post.id,
              parentThreadId: post.parentThreadId ?? null,
            },
          })
        )
      }
      if (isDetailMain) {
        router.push("/")
      }
    } else {
      alert(result.error || "Failed to delete.")
    }
  }

  const totalCommentCount = Math.max(
    post.commentCount ?? 0,
    post.replies?.length ?? 0
  )

  const handleOpenThread = () => {
    if (!sessionData?.user) {
      router.push("/signin")
      return
    }
    if (onCommentClick) {
      onCommentClick(post.id)
      return
    }
    if (!isDetailMain) {
      router.push(`/thread/${post.id}`)
    }
  }

  return (
    <article className={cn("px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col gap-3", className)}>
      {isDetailMain ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${post.author.username}`}>
                <ThreadAvatar
                  src={post.author.avatarUrl}
                  alt={post.author.username}
                  fallback={post.author.fallback}
                  hasFollowBadge={post.author.hasFollowBadge}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                />
              </Link>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/profile/${post.author.username}`}
                  className="font-semibold text-sm text-foreground hover:underline cursor-pointer"
                >
                  {post.author.username}
                </Link>
                {post.author.verified && (
                  <RiVerifiedBadgeFill className="size-4 text-sky-500" />
                )}
                <span className="text-xs text-muted-foreground">
                  {post.timeAgo}
                </span>
              </div>
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
                <DropdownMenuItem
                  className="cursor-pointer flex items-center justify-between"
                  onClick={handleToggleSave}
                >
                  <span>{isSaved ? "Unsave" : "Save"}</span>
                  {isSaved ? (
                    <RiBookmarkFill className="size-4" />
                  ) : (
                    <RiBookmarkLine className="size-4" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard?.writeText(
                        `${window.location.origin}/thread/${post.id}`
                      )
                    }
                  }}
                >
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Mute author
                </DropdownMenuItem>
                {isOwner && (
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive flex items-center justify-between"
                    onClick={() => setIsConfirmDeleteOpen(true)}
                  >
                    <span>Delete</span>
                    <RiDeleteBinLine className="size-4" />
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="text-[15px] leading-relaxed text-foreground/95 flex flex-col gap-3 font-normal">
            {typeof post.content === "string"
              ? renderFormattedText(post.content, showTranslateButton)
              : post.content}
          </div>

          {post.imageUrl && (
            <div className="relative w-full overflow-hidden rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 my-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt="Post attachment"
                className="w-full h-auto max-h-[500px] object-cover sm:object-contain bg-neutral-950/40"
                loading="lazy"
              />
            </div>
          )}

          {post.linkPreview && <ThreadPreviewCard preview={post.linkPreview} />}

          <ThreadActions
            likeCount={post.likeCount}
            commentCount={totalCommentCount}
            repostCount={post.repostCount}
            shareCount={post.shareCount}
            isLiked={post.isLiked}
            onToggleLike={() => onToggleLike?.(post.id)}
            onCommentClick={handleOpenThread}
          />
        </div>
      ) : (
        <div className="flex gap-3.5">
        <div className="flex flex-col items-center">
          <Link href={`/profile/${post.author.username}`}>
            <ThreadAvatar
              src={post.author.avatarUrl}
              alt={post.author.username}
              fallback={post.author.fallback}
              hasFollowBadge={post.author.hasFollowBadge}
              className="cursor-pointer hover:opacity-90 transition-opacity"
            />
          </Link>
        </div>

        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-semibold text-sm text-foreground hover:underline cursor-pointer"
              >
                {post.author.username}
              </Link>
              {post.author.verified && (
                <RiVerifiedBadgeFill className="size-4 text-sky-500" />
              )}
              <button
                type="button"
                onClick={handleOpenThread}
                className="text-xs text-muted-foreground hover:underline cursor-pointer"
              >
                {post.timeAgo}
              </button>
              {post.author.badges?.map((badge, idx) => (
                <React.Fragment key={idx}>{badge}</React.Fragment>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {post.author.badgeIcons?.includes("author") && (
                <span
                  className="text-xs text-muted-foreground  "
                  title="Replied"
                >
                  ✏️
                </span>
              )}
              {post.author.badgeIcons?.includes("liked_by_author") && (
                <span
                  className="inline-flex items-center gap-0.5 text-[11px] leading-none  "
                  title="Liked by author"
                >
                  <span className="text-rose-500">❤️</span>
                </span>
              )}

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
                  <DropdownMenuItem
                    className="cursor-pointer flex items-center justify-between"
                    onClick={handleToggleSave}
                  >
                    <span>{isSaved ? "Unsave" : "Save"}</span>
                    {isSaved ? (
                      <RiBookmarkFill className="size-4" />
                    ) : (
                      <RiBookmarkLine className="size-4" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        navigator.clipboard?.writeText(
                          `${window.location.origin}/thread/${post.id}`
                        )
                      }
                    }}
                  >
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Mute author
                  </DropdownMenuItem>
                  {isOwner && (
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive flex items-center justify-between"
                      onClick={() => setIsConfirmDeleteOpen(true)}
                    >
                      <span>Delete</span>
                      <RiDeleteBinLine className="size-4" />
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="cursor-pointer text-destructive">
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div
            onClick={!isDetailMain ? handleOpenThread : undefined}
            onMouseEnter={
              !isDetailMain ? () => prefetchThreadDetail(post.id) : undefined
            }
            className={cn(
              "text-[14px] leading-relaxed text-foreground/95 flex flex-col gap-3 font-normal",
              !isDetailMain && "cursor-pointer"
            )}
          >
            {typeof post.content === "string"
              ? renderFormattedText(
                  post.content,
                  showTranslateButton || post.author.username === "miqdadbadjuber"
                )
              : post.content}
          </div>

          {post.imageUrl && (
            <div
              onClick={!isDetailMain ? handleOpenThread : undefined}
              className={cn(
                "relative w-fit overflow-hidden rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 my-1",
                !isDetailMain && "cursor-pointer"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt="Post attachment"
                className="w-fit h-auto max-h-[480px] object-cover sm:object-contain bg-neutral-950/40"
                loading="lazy"
              />
            </div>
          )}

          {post.linkPreview && <ThreadPreviewCard preview={post.linkPreview} />}

          <ThreadActions
            likeCount={post.likeCount}
            commentCount={totalCommentCount}
            repostCount={post.repostCount}
            shareCount={post.shareCount}
            isLiked={post.isLiked}
            onToggleLike={() => onToggleLike?.(post.id)}
            onCommentClick={handleOpenThread}
          />
        </div>
      </div>
      )}

      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="max-w-xs sm:max-w-sm rounded-2xl p-5 text-center">
          <DialogHeader className="gap-2 sm:text-center">
            <DialogTitle className="text-base font-semibold">
              Delete {post.parentThreadId ? "reply" : "thread"}?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete this {post.parentThreadId ? "reply" : "thread"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full flex-1 cursor-pointer"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              }
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="rounded-full flex-1 cursor-pointer"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  )
}


