"use client"

import * as React from "react"
import { SearchHeader } from "./search-header"
import { SearchResultItem } from "./search-result-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SearchUserItem } from "../types"
import { cn } from "@/lib/utils"

export interface SearchViewProps {
  initialUsers?: SearchUserItem[]
  className?: string
}

const defaultSuggestions: SearchUserItem[] = [
  {
    id: "s-1",
    username: "github",
    fullName: "GitHub",
    bio: "The AI-powered developer platform to build, scale, and deliver secure software.",
    avatarUrl: "https://api.dicebear.com/9.x/identicon/svg?seed=github",
    fallback: "GH",
    verified: true,
    followersCountText: "468K followers",
    isFollowing: false,
  },
  {
    id: "s-2",
    username: "dailyaionly",
    fullName: "Daily AI Only",
    bio: "Learn How I Gained 10K Followers on Threads in 25 Days With Free ChatGPT ↓",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=dailyaionly",
    fallback: "DA",
    verified: false,
    followersCountText: "17.7K followers",
    isFollowing: false,
  },
  {
    id: "s-3",
    username: "sysxplore",
    fullName: "Linux | sysadmin | devops | 2K 🎸",
    bio: "Everything about Linux 🐧, DevOps, Automation, sysadmin 🐱 💻 & beginner tips 💡 Newsletter → http://sysxplore.substack.com",
    avatarUrl: "https://api.dicebear.com/9.x/bottts/svg?seed=sysxplore",
    fallback: "SX",
    verified: true,
    followersCountText: "90.8K followers",
    isFollowing: false,
  },
  {
    id: "s-4",
    username: "openbot.run",
    fullName: "OpenBot",
    bio: "One workspace for your team and AI coworkers. Multiplayer. Free for personal use. Works with any model you already have.",
    avatarUrl: "https://api.dicebear.com/9.x/identicon/svg?seed=openbot",
    fallback: "OB",
    verified: false,
    followersCountText: "291 followers",
    isFollowing: false,
  },
  {
    id: "s-5",
    username: "ui.abraham",
    fullName: "UX / UI Designer . Abraham John",
    bio: "Product Designer ( UI / UX ) | Brand Identity Designer | Creating Beautiful Functional UI's",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=abraham",
    fallback: "UA",
    verified: false,
    followersCountText: "32.9K followers",
    isFollowing: false,
  },
  {
    id: "s-6",
    username: "mathstarverse",
    fullName: "MATHEMATICS FEELS",
    bio: "Exploring the beauty and elegance of mathematics through visuals and code.",
    avatarUrl: "https://api.dicebear.com/9.x/identicon/svg?seed=mathstarverse",
    fallback: "MS",
    verified: false,
    followersCountText: "3,934 followers",
    isFollowing: false,
  },
]

export function SearchView({
  initialUsers = defaultSuggestions,
  className,
}: SearchViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [users, setUsers] = React.useState<SearchUserItem[]>(initialUsers)

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return users
    const query = searchQuery.toLowerCase()
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(query) ||
        u.fullName.toLowerCase().includes(query) ||
        (u.bio && u.bio.toLowerCase().includes(query))
    )
  }, [searchQuery, users])

  const handleToggleFollow = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isFollowing: !u.isFollowing } : u))
    )
  }

  return (
    <ScrollArea
      className={cn(
        "h-screen w-full max-w-[668px] mx-auto px-2 md:px-4 py-4 select-none",
        "no-scrollbar **:data-[slot=scroll-area-scrollbar]:hidden **:data-[slot=scroll-area-viewport]:no-scrollbar",
        className
      )}
    >
      <div className="flex flex-col pb-24">
        {/* Search Input and Filter Header */}
        <SearchHeader
          value={searchQuery}
          onChange={setSearchQuery}
          onFilterClick={() => {}}
        />

        {/* Search Results / Follow Suggestions Card Container */}
        <div className="w-full rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 text-card-foreground shadow-xs overflow-hidden">
          <div className="px-6 pt-5 pb-2">
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
              {searchQuery ? "Search results" : "Follow suggestions"}
            </h2>
          </div>

          <div className="divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <SearchResultItem
                  key={user.id}
                  user={user}
                  onToggleFollow={handleToggleFollow}
                />
              ))
            ) : (
              <div className="p-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                No users found for &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
