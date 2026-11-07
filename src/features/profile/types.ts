export interface ProfileUser {
  id?: string
  email?: string
  name: string
  username: string
  bio?: string
  link?: {
    label: string
    url: string
    extraCount?: number
  }
  communities?: string[]
  extraCommunitiesCount?: number
  avatarUrl: string
  followersCount: number
  followingCount?: number
  followerAvatars?: string[]
  verified?: boolean
  hasFollowBadge?: boolean
  isPrivate?: boolean
  showInstagramBadge?: boolean
  showRecentViews?: boolean
  podcastUrl?: string
  interests?: string
  isFollowing?: boolean
  isSelf?: boolean
}

export interface SetupCardItem {
  id: string
  title: string
  description: string
  actionLabel: string
  isDone: boolean
  onClick?: () => void
}

export interface FollowerUserItem {
  id: string
  username: string
  fullName: string
  avatarUrl?: string
  verified?: boolean
  isFollowing?: boolean
  isSelf?: boolean
}

