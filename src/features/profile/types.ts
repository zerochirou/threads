export interface ProfileUser {
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
  isFollowing?: boolean
}
