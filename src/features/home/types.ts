export interface FollowMutualFollower {
  avatarUrl: string
  alt: string
  fallback?: string
}

export interface FollowSuggestion {
  id: string
  username: string
  displayName?: string
  avatarUrl: string
  fallback: string
  verified?: boolean
  bio: string
  followersCount: string
  mutualFollowers?: FollowMutualFollower[]
  isFollowing?: boolean
}
