"use client"

import * as React from "react"
import type { ThreadPostItem } from "../types"
import { DEFAULT_POSTS } from "../constants/default-posts"
import { useThreadsFeed } from "../services/threads-service"
import { FeedHeader } from "./feed-header"
import { PostComposer } from "@/features/composer"
import { ThreadCard } from "./thread-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export interface ContentScrollbarProps {
  posts?: ThreadPostItem[]
  className?: string
  feedTitle?: string
}

export function ContentScrollbar({
  posts: initialPosts,
  className,
  feedTitle = "For you",
}: ContentScrollbarProps) {
  const { posts, toggleLike, toggleSave, prependPost, removePost } = useThreadsFeed(initialPosts)
  const [persistedDefaultPosts, setPersistedDefaultPosts] = React.useState<ThreadPostItem[]>(DEFAULT_POSTS)

  React.useEffect(() => {
    const handlePostCreated = (event: Event) => {
      const customEvent = event as CustomEvent<ThreadPostItem>
      const newPost = customEvent.detail
      if (!newPost) return
      void prependPost(newPost)
    }

    const handleThreadDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<{ threadId: string }>
      const deletedId = customEvent.detail?.threadId
      if (!deletedId) return
      void removePost(deletedId)
      setPersistedDefaultPosts((prev) => prev.filter((p) => p.id !== deletedId))
    }

    window.addEventListener("threads:post-created", handlePostCreated)
    window.addEventListener("threads:thread-deleted", handleThreadDeleted)
    return () => {
      window.removeEventListener("threads:post-created", handlePostCreated)
      window.removeEventListener("threads:thread-deleted", handleThreadDeleted)
    }
  }, [prependPost, removePost])

  const handleToggleDefaultLike = (postId: string) => {
    setPersistedDefaultPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post
        const nextLiked = !post.isLiked
        return {
          ...post,
          isLiked: nextLiked,
          likeCount: Math.max(0, post.likeCount + (nextLiked ? 1 : -1)),
        }
      })
    )
  }

  const handleToggleDefaultSave = (postId: string, nextSaved: boolean) => {
    setPersistedDefaultPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, isSaved: nextSaved } : post))
    )
  }

  const handleRemoveDefaultPost = (postId: string) => {
    setPersistedDefaultPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  // Combine hard-coded default posts on top followed by dynamic feed posts
  const combinedPosts = React.useMemo(() => {
    const defaultIds = new Set(persistedDefaultPosts.map((p) => p.id))
    const filteredFeedPosts = (posts || []).filter((p) => !defaultIds.has(p.id))
    return [...persistedDefaultPosts, ...filteredFeedPosts]
  }, [persistedDefaultPosts, posts])

  return (
    <ScrollArea
      className={cn(
        "h-dvh w-full max-w-[668px] mx-auto px-0 md:px-4 pt-1 md:py-4",
        "no-scrollbar **:data-[slot=scroll-area-scrollbar]:hidden **:data-[slot=scroll-area-viewport]:no-scrollbar",
        className,
      )}
    >
      <div className="flex flex-col gap-1.5 md:gap-3 pb-24">
        <FeedHeader title={feedTitle} showMobileLogo />

        <div className="w-full md:rounded-xl border-y md:border border-neutral-200/90 dark:border-neutral-800/80 text-card-foreground shadow-xs overflow-hidden divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
          <PostComposer />

          {combinedPosts.map((post) => {
            const isDefault = post.id.startsWith("default-post-")
            return (
              <ThreadCard
                key={post.id}
                post={post}
                onToggleLike={isDefault ? handleToggleDefaultLike : toggleLike}
                onToggleSave={isDefault ? handleToggleDefaultSave : toggleSave}
                onDeleted={isDefault ? handleRemoveDefaultPost : removePost}
              />
            )
          })}
        </div>
      </div>
    </ScrollArea>
  )
}
