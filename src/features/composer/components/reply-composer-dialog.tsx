"use client"

import * as React from "react"
import {
  RiImageLine,
  RiFileGifLine,
  RiHeartLine,
  RiEmotionHappyLine,
  RiEqualizerLine,
  RiDoubleQuotesL,
  RiListCheck,
  RiMapPin2Line,
  RiMusic2Line,
  RiMoreFill,
  RiArrowUpDownLine,
  RiVerifiedBadgeFill,
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
import type { ThreadPostItem, ThreadReplyItem } from "@/features/content-scrollbar/types"
import { ThreadAvatar } from "@/features/content-scrollbar"
import { useComposerMutations } from "../services/composer-service"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export interface ReplyComposerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentPost: ThreadPostItem
  onReplySuccess?: (reply: ThreadReplyItem) => void
}

export function ReplyComposerDialog({
  open,
  onOpenChange,
  parentPost,
  onReplySuccess,
}: ReplyComposerDialogProps) {
  const { data: sessionData } = useSession()
  const authUser = sessionData?.user

  const resolvedUserName =
    authUser?.username ||
    authUser?.email?.split("@")[0]?.toLowerCase() ||
    "zerochirou"
  const resolvedAvatarUrl =
    authUser?.image ||
    `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(resolvedUserName)}`
  const resolvedFallback = (authUser?.name || resolvedUserName)
    .slice(0, 2)
    .toUpperCase()

  const [replyText, setReplyText] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const { createReply } = useComposerMutations()

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return
    if (!nextOpen) {
      setReplyText("")
      setError(null)
    }
    onOpenChange(nextOpen)
  }

  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 80)
    }
  }, [open])

  const handleReplySubmit = async () => {
    const trimmed = replyText.trim()
    if (!trimmed || isSubmitting) return

    setError(null)
    setIsSubmitting(true)

    const result = await createReply({
      parentThreadId: parentPost.id,
      content: trimmed,
    })

    if (!result.ok) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    onReplySuccess?.(result.reply)
    setReplyText("")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const toolbarActions = [
    { icon: RiImageLine, label: "Add photo or video" },
    { icon: RiFileGifLine, label: "Add GIF" },
    { icon: RiHeartLine, label: "Add reaction" },
    { icon: RiEmotionHappyLine, label: "Add emoji" },
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
          <DialogTitle>Reply</DialogTitle>
          <DialogDescription>
            Reply to {parentPost.author.username}&apos;s thread
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
            Reply
          </span>

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
                        className="size-7 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer"
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

        <div className="px-4 sm:px-6 py-4 max-h-[70dvh] overflow-y-auto no-scrollbar">
          {error && (
            <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-2 text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col">
            <div className="flex items-start gap-3.5 relative">
              <div className="flex flex-col items-center self-stretch shrink-0">
                <ThreadAvatar
                  src={parentPost.author.avatarUrl}
                  alt={parentPost.author.username}
                  fallback={parentPost.author.fallback}
                  size="default"
                  hasFollowBadge={parentPost.author.hasFollowBadge}
                />
                <div className="w-[2px] flex-1 min-h-[36px] bg-neutral-800 my-1 rounded-full" />
              </div>

              <div className="flex-1 min-w-0 pb-3">
                <div className="flex items-center gap-1.5 text-sm leading-none flex-wrap">
                  <span className="font-semibold text-white tracking-tight">
                    {parentPost.author.username}
                  </span>
                  {parentPost.author.verified && (
                    <RiVerifiedBadgeFill className="size-3.5 text-neutral-400" />
                  )}
                  <span className="text-xs text-neutral-500 font-normal">
                    {parentPost.timeAgo}
                  </span>
                </div>

                <div className="text-[14px] leading-relaxed text-neutral-200 mt-1.5 line-clamp-6 whitespace-pre-wrap">
                  {parentPost.content}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 relative">
              <div className="flex flex-col items-center self-stretch shrink-0">
                <ThreadAvatar
                  src={resolvedAvatarUrl}
                  alt={resolvedUserName}
                  fallback={resolvedFallback}
                  size="default"
                />
                <div className="w-[2px] flex-1 min-h-[40px] bg-neutral-800 my-1 rounded-full" />
              </div>

              <div className="flex-1 min-w-0 pb-3">
                <div className="flex items-center gap-1.5 text-sm leading-none flex-wrap min-h-6">
                  <span className="font-semibold text-white tracking-tight">
                    {resolvedUserName}
                  </span>
                  <span className="text-neutral-500 font-normal">&gt;</span>
                  <button
                    type="button"
                    className="text-neutral-500 hover:text-neutral-300 transition-colors text-sm font-normal cursor-pointer"
                  >
                    Community or topic
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${parentPost.author.username}...`}
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
            disabled={!replyText.trim() || isSubmitting}
            onClick={handleReplySubmit}
            className="rounded-full px-5 h-9 font-semibold text-sm bg-white text-black hover:bg-neutral-200 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
