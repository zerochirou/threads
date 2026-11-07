import type { ReactNode } from "react"

export interface ThreadAuthor {
  id?: string
  name?: string
  username: string
  avatarUrl?: string
  fallback: string
  verified?: boolean
  hasFollowBadge?: boolean
  badges?: ReactNode[]
  badgeIcons?: string[]
}

export interface ThreadLinkPreview {
  url: string
  domain: string
  title: string
  headline?: string
  subheadline?: string
  tagline?: string
}

export interface ThreadReplyItem {
  id: string
  parentThreadId: string
  author: ThreadAuthor
  timeAgo: string
  content: string
  likeCount: number
  commentCount?: number
  repostCount?: number
  shareCount?: number
  isLiked?: boolean
  isSaved?: boolean
  linkPreview?: ThreadLinkPreview
  createdAt?: string
}

export interface ThreadPostItem {
  id: string
  author: ThreadAuthor
  timeAgo: string
  content: ReactNode
  likeCount: number
  commentCount?: number
  repostCount?: number
  shareCount?: number
  viewsCount?: string
  isLiked?: boolean
  isSaved?: boolean
  linkPreview?: ThreadLinkPreview
  parentThreadId?: string | null
  replies?: ThreadReplyItem[]
}

