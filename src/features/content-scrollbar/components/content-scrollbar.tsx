"use client"

import * as React from "react"
import Link from "next/link"
import type { ThreadPostItem } from "../types"
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
  const defaultPosts: ThreadPostItem[] = React.useMemo(
    () => [
      {
        id: "post-1",
        author: {
          username: "fajarhide",
          avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=fajarhide",
          fallback: "FH",
          verified: true,
          hasFollowBadge: true,
        },
        timeAgo: "3h",
        content: (
          <>
            <p>liat GitHub trending minggu ini, lucu juga..</p>
            <p>
              dari 16 repo, 4 isinya skill biar coding agent bikin UI yg gk keliatan dibikin AI 🤣 hallmark, impeccable, taste-skill, sama skills nya jakubkrehel
            </p>
            <p>impeccable aja nambah 9 rb an star seminggu</p>
            <p>
              jd skrg AI dipake buat ngoding, trus butuh AI lagi biar hasilnya gk keliatan AI wkwk
            </p>
            <p>kalian bisa bedain gk UI bikinan AI sama bikinan orang??</p>
          </>
        ),
        likeCount: 48,
        commentCount: 12,
        shareCount: 2,
        isLiked: false,
      },
      {
        id: "post-2",
        author: {
          username: "miqdadbadjuber",
          avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=miqdadbadjuber",
          fallback: "MB",
          badges: [
            <span key="author" className="text-xs" title="Author">✏️</span>,
            <span key="badge" className="inline-flex items-center justify-center size-3.5 rounded-full bg-rose-500/20 text-rose-500 text-[9px] leading-none">❤️</span>,
          ],
        },
        timeAgo: "3h",
        content: (
          <>
            <p>Salah satu alasan kenapa antislop ga ada skill desain biar UI makin cakep:</p>
            <div className="flex flex-col gap-1 pl-1">
              <p>1. Selera manusia dan AI itu beda.</p>
              <p>2. Klo ada pun ga semua suka sama template desain yang udh disediakan.</p>
            </div>
            <p>
              Only fokus kill the slop, masalah desain urusan masing2, taste manusia dan taste ai belum selaras sampai saat ini.
            </p>
            <p>
              Ini bisa jadi alasan kenapa ada{" "}
              <Link
                href="https://antislop.ai.id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline font-medium"
              >
                antislop.ai.id
              </Link>{" "}
              yang fokus kill elemen slop dan{" "}
              <Link
                href="https://style.ai.id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline font-medium"
              >
                style.ai.id
              </Link>{" "}
              yang fokus ke tampilan website.
            </p>
            <p>
              Klo ga dikasih taste masing2 ya alhasil flat wkwk, Human art will always win.{" "}
              <button
                type="button"
                className="text-muted-foreground hover:underline text-xs cursor-pointer inline-block ml-1"
              >
                Translate
              </button>
            </p>
          </>
        ),
        likeCount: 29,
        repostCount: 3,
        shareCount: 4,
        isLiked: false,
        linkPreview: {
          url: "https://style.ai.id",
          domain: "style.ai.id",
          title: "Style UI - Curated UI Libraries, Design Tools & Backgrounds",
          headline: "AI will never understand your taste.",
          subheadline: "Find yours here.",
          tagline: "Curated UI libraries, background generators, and starter kits.",
        },
      },
    ],
    []
  )

  const [posts, setPosts] = React.useState<ThreadPostItem[]>(initialPosts ?? defaultPosts)

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked
          return {
            ...post,
            isLiked,
            likeCount: post.likeCount + (isLiked ? 1 : -1),
          }
        }
        return post
      })
    )
  }

  return (
    <ScrollArea
      className={cn(
        "h-screen w-full max-w-[668px] mx-auto px-2 md:px-4 py-4",
        "no-scrollbar **:data-[slot=scroll-area-scrollbar]:hidden **:data-[slot=scroll-area-viewport]:no-scrollbar",
        className
      )}
    >
      <div className="flex flex-col gap-3 pb-24">
        {/* Feed Header */}
        <FeedHeader title={feedTitle} />

        {/* Main Feed Card Container */}
        <div className="w-full rounded-xl border border-neutral-200/90 dark:border-neutral-700/50 text-card-foreground shadow-xs overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-700/50">
          <PostComposer />

          {posts.map((post) => (
            <ThreadCard
              key={post.id}
              post={post}
              onToggleLike={handleToggleLike}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
