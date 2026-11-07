import type { ReactNode } from "react"

export interface ThreadAuthor {
  username: string
  avatarUrl?: string
  fallback: string
  verified?: boolean
  hasFollowBadge?: boolean
  badges?: ReactNode[]
}

export interface ThreadLinkPreview {
  url: string
  domain: string
  title: string
  headline?: string
  subheadline?: string
  tagline?: string
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
  isLiked?: boolean
  linkPreview?: ThreadLinkPreview
}
