"use client"

import * as React from "react"
import type { ThreadPostItem } from "@/features/content-scrollbar/types"
import { ThreadAvatar } from "@/features/content-scrollbar"
import { PostComposerDialog } from "./post-composer-dialog"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export interface PostComposerProps {
  userAvatarUrl?: string
  userFallback?: string
  userName?: string
  onPostCreated?: (threads: string[], createdPost?: ThreadPostItem) => void
  className?: string
}

export function PostComposer({
  userAvatarUrl,
  userFallback,
  userName,
  onPostCreated,
  className,
}: PostComposerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const { data: sessionData } = useSession()

  const authUser = sessionData?.user
  const resolvedUserName =
    userName ||
    authUser?.username ||
    authUser?.email?.split("@")[0]?.toLowerCase() ||
    "zerochirou"
  const resolvedAvatarUrl =
    userAvatarUrl ||
    authUser?.image ||
    `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(resolvedUserName)}`
  const resolvedFallback =
    userFallback ||
    (authUser?.name || resolvedUserName).slice(0, 2).toUpperCase()

  return (
    <>
      <div className={cn("px-4 sm:px-6 pt-4 sm:pt-6 pb-3.5 sm:pb-4 flex items-center gap-3", className)}>
        <ThreadAvatar
          src={resolvedAvatarUrl}
          alt={resolvedUserName}
          fallback={resolvedFallback}
          size="default"
        />

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex-1 text-left text-sm text-muted-foreground hover:text-foreground/80 transition-colors cursor-pointer py-1.5"
        >
          What&apos;s new?
        </button>

        <Button
          size="lg"
          variant="ghost"
          onClick={() => setIsOpen(true)}
          className="px-4 h-9 font-semibold border-neutral-700 hover:text-foreground cursor-pointer"
        >
          Post
        </Button>
      </div>

      <PostComposerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        userName={resolvedUserName}
        userAvatarUrl={resolvedAvatarUrl}
        userFallback={resolvedFallback}
        onPostSuccess={onPostCreated}
      />
    </>
  )
}

