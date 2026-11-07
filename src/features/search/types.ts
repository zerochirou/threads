export interface SearchUserItem {
  id: string
  username: string
  fullName: string
  bio?: string
  avatarUrl?: string
  fallback: string
  verified?: boolean
  followersCountText?: string
  isFollowing?: boolean
  isSelf?: boolean
}
