"use client"

import * as React from "react"
import { ThreadAvatar } from "@/features/content-scrollbar"
import { PostComposerDialog } from "./post-composer-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PostComposerProps {
  userAvatarUrl?: string
  userFallback?: string
  userName?: string
  onPostCreated?: (threads: string[]) => void
  className?: string
}

export function PostComposer({
  userAvatarUrl = "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=threads-user",
  userFallback = "ZC",
  userName = "zerochirou",
  onPostCreated,
  className,
}: PostComposerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <div className={cn("px-6 pt-6 pb-4 flex items-center gap-3", className)}>
        <ThreadAvatar
          src={userAvatarUrl}
          alt="Your avatar"
          fallback={userFallback}
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
        userName={userName}
        userAvatarUrl={userAvatarUrl}
        userFallback={userFallback}
        onPostSuccess={onPostCreated}
      />
    </>
  )
}
