"use client"

import * as React from "react"
import {
  RiImageLine,
  RiFileGifLine,
  RiHeartLine,
  RiEmotionHappyLine,
  RiMicLine,
  RiEqualizerLine,
  RiDoubleQuotesL,
  RiListCheck,
  RiMapPin2Line,
  RiMusic2Line,
  RiFileTextLine,
  RiMoreFill,
  RiCloseLine,
  RiArrowUpDownLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ThreadPostItem } from "@/features/content-scrollbar/types"
import { ThreadAvatar } from "@/features/content-scrollbar"
import { useComposerMutations } from "../services/composer-service"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export interface ThreadEntry {
  id: string
  content: string
}

export interface PostComposerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName?: string
  userAvatarUrl?: string
  userFallback?: string
  onPostSuccess?: (threads: string[], createdPost?: ThreadPostItem) => void
}

export function PostComposerDialog({
  open,
  onOpenChange,
  userName,
  userAvatarUrl,
  userFallback,
  onPostSuccess,
}: PostComposerDialogProps) {
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
  const [threads, setThreads] = React.useState<ThreadEntry[]>([
    { id: "thread-1", content: "" },
  ])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { createThread } = useComposerMutations()

  const textareaRefs = React.useRef<(HTMLTextAreaElement | null)[]>([])

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return
    if (!nextOpen) {
      setThreads([{ id: "thread-1", content: "" }])
      setError(null)
    }
    onOpenChange(nextOpen)
  }

  const updateThreadContent = (index: number, value: string) => {
    setThreads((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], content: value }
      return next
    })
  }

  const addThread = () => {
    setThreads((prev) => [
      ...prev,
      { id: `thread-${Date.now()}`, content: "" },
    ])
    setTimeout(() => {
      const lastIndex = threads.length
      textareaRefs.current[lastIndex]?.focus()
    }, 50)
  }

  const removeThread = (indexToRemove: number) => {
    if (threads.length <= 1) return
    setThreads((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handlePost = async () => {
    const validThreads = threads
      .map((t) => t.content.trim())
      .filter(Boolean)
    if (validThreads.length === 0 || isSubmitting) return

    setError(null)
    setIsSubmitting(true)

    const result = await createThread(validThreads)
    if (!result.ok) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    onPostSuccess?.(validThreads, result.post)
    setThreads([{ id: "thread-1", content: "" }])
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const hasAnyContent = threads.some((t) => t.content.trim().length > 0)

  const toolbarActions = [
    { icon: RiImageLine, label: "Add photo or video" },
    { icon: RiFileGifLine, label: "Add GIF" },
    { icon: RiHeartLine, label: "Add reaction" },
    { icon: RiEmotionHappyLine, label: "Add emoji" },
    { icon: RiMicLine, label: "Voice note" },
    { icon: RiEqualizerLine, label: "Audio clip" },
    { icon: RiDoubleQuotesL, label: "Add quote" },
    { icon: RiListCheck, label: "Add poll" },
    { icon: RiMapPin2Line, label: "Add location" },
    { icon: RiMusic2Line, label: "Add music" },
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "w-full max-w-[calc(100%-1.5rem)] sm:max-w-[620px] rounded-2xl bg-[#181818] text-white border border-neutral-800 p-0 shadow-2xl overflow-hidden gap-0"
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>New thread</DialogTitle>
          <DialogDescription>
            Create and publish a new multi-post thread.
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/5">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onOpenChange(false)}
            className="text-[15px] font-normal text-white hover:text-white hover:bg-transparent p-0 h-auto cursor-pointer"
          >
            Cancel
          </Button>

          <span className="text-[15px] font-bold text-white tracking-tight">
            New thread
          </span>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="size-7 rounded-full text-neutral-400 hover:text-white hover:bg-white/10"
                    aria-label="Drafts"
                  >
                    <RiFileTextLine className="size-4" />
                  </Button>
                }
              />
              <TooltipContent side="bottom">Drafts</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="size-7 rounded-full text-neutral-400 hover:text-white hover:bg-white/10"
                          aria-label="More options"
                        >
                          <RiMoreFill className="size-4" />
                        </Button>
                      }
                    />
                  }
                />
                <TooltipContent side="bottom">More</TooltipContent>
              </Tooltip>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-[#242424] text-white border-neutral-700"
              >
                <DropdownMenuItem className="cursor-pointer">
                  Save draft
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Delete draft
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 max-h-[70dvh] overflow-y-auto no-scrollbar">
          {error && (
            <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-2 text-xs text-red-300">
              {error}
            </div>
          )}
          <div className="flex flex-col">
            {threads.map((thread, index) => {
              const isFirst = index === 0
              const counterText =
                threads.length > 1 ? `${index + 1}/${threads.length}` : null

              return (
                <div key={thread.id} className="flex items-start gap-3.5 relative">
                  <div className="flex flex-col items-center self-stretch shrink-0">
                    <ThreadAvatar
                      src={resolvedAvatarUrl}
                      alt={resolvedUserName}
                      fallback={resolvedFallback}
                      size="default"
                    />
                    <div className="w-[2px] flex-1 min-h-[50px] bg-neutral-800 my-1 rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0 pb-3">
                    <div className="flex items-center justify-between min-h-6">
                      <div className="flex items-center gap-1.5 text-sm leading-none flex-wrap">
                        <span className="font-semibold text-white tracking-tight">
                          {resolvedUserName}
                        </span>

                        {isFirst ? (
                          <>
                            <span className="text-neutral-500 font-normal">&gt;</span>
                            <button
                              type="button"
                              className="text-neutral-500 hover:text-neutral-300 transition-colors text-sm font-normal cursor-pointer"
                            >
                              Community or topic
                            </button>
                          </>
                        ) : null}

                        {counterText && (
                          <span className="text-xs text-neutral-500 font-normal ml-1">
                            {counterText}
                          </span>
                        )}
                      </div>

                      {!isFirst && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeThread(index)}
                          className="size-5 rounded-full text-neutral-500 hover:text-white hover:bg-white/10"
                          aria-label="Remove thread item"
                        >
                          <RiCloseLine className="size-3.5" />
                        </Button>
                      )}
                    </div>

                    <textarea
                      ref={(el) => {
                        textareaRefs.current[index] = el
                      }}
                      value={thread.content}
                      onChange={(e) => updateThreadContent(index, e.target.value)}
                      placeholder={isFirst ? "What's new?" : "Say more..."}
                      rows={2}
                      className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-white placeholder:text-neutral-500 outline-none border-0 focus:ring-0 p-0 mt-1 selection:bg-neutral-700"
                    />

                    <div className="flex items-center flex-wrap gap-1 pt-2 -ml-1 text-neutral-500">
                      {toolbarActions.map((action) => (
                        <Tooltip key={action.label}>
                          <TooltipTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                className="size-7 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                                aria-label={action.label}
                              >
                                <action.icon className="size-[17px]" />
                              </Button>
                            }
                          />
                          <TooltipContent side="bottom" className="text-xs">
                            {action.label}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="flex items-center gap-3.5 pt-1">
              <div className="flex items-center justify-center size-9 shrink-0">
                <ThreadAvatar
                  src={resolvedAvatarUrl}
                  alt={resolvedUserName}
                  fallback={resolvedFallback}
                  size="sm"
                  className="opacity-60"
                />
              </div>

              <button
                type="button"
                onClick={addThread}
                className="text-sm font-normal text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer py-1.5"
              >
                Add to thread
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-t border-white/5">
          <button
            type="button"
            className="flex items-center gap-2 text-xs font-normal text-neutral-400 hover:text-white transition-colors cursor-pointer group"
          >
            <div className="size-4 rounded-md border border-neutral-600 flex items-center justify-center text-[10px] group-hover:border-neutral-400">
              <RiArrowUpDownLine className="size-3" />
            </div>
            <span>Post options</span>
          </button>

          <Button
            type="button"
            size="sm"
            disabled={!hasAnyContent || isSubmitting}
            onClick={handlePost}
            className="rounded-full px-5 h-9 font-semibold text-sm bg-white text-black hover:bg-neutral-200 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
