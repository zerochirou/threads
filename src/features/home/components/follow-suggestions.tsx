"use client"

import * as React from "react"
import type { FollowSuggestion } from "../types"
import { SearchBar } from "./search-bar"
import { FollowItem } from "./follow-item"
import { HomeFooter } from "./home-footer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export interface FollowSuggestionsProps {
  suggestions?: FollowSuggestion[]
  className?: string
}

export function FollowSuggestions({
  suggestions: initialSuggestions,
  className,
}: FollowSuggestionsProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const defaultSuggestions: FollowSuggestion[] = React.useMemo(
    () => [
      {
        id: "sug-1",
        username: "testingcatalog",
        displayName: "🚨 AI News | Testing...",
        avatarUrl: "https://api.dicebear.com/9.x/bottts/svg?seed=testingcatalog",
        fallback: "TC",
        verified: true,
        bio: "Latest AI News on AI Agents, Model Releases, Tools, Leaks, and Rumors 🗞️",
        followersCount: "43.1K followers",
        mutualFollowers: [
          { avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=mut1", alt: "Follower 1" },
          { avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=mut2", alt: "Follower 2" },
        ],
        isFollowing: false,
      },
      {
        id: "sug-2",
        username: "github",
        displayName: "GitHub",
        avatarUrl: "https://api.dicebear.com/9.x/identicon/svg?seed=github-official",
        fallback: "GH",
        verified: true,
        bio: "The AI-powered developer platform to build, scale, and deliver secure software.",
        followersCount: "468K followers",
        mutualFollowers: [
          { avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=mut3", alt: "Follower 3" },
          { avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=mut4", alt: "Follower 4" },
        ],
        isFollowing: false,
      },
      {
        id: "sug-3",
        username: "dailyaiionly",
        displayName: "Daily AI Only",
        avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=dailyai",
        fallback: "DA",
        verified: false,
        bio: "Learn How I Gained 10K Followers on Threads in 25 Days With Free ChatGPT ↓",
        followersCount: "17.7K followers",
        mutualFollowers: [
          { avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=mut5", alt: "Follower 5" },
        ],
        isFollowing: false,
      },
      {
        id: "sug-4",
        username: "sysxplore",
        displayName: "Linux | sysadmin | de...",
        avatarUrl: "https://api.dicebear.com/9.x/identicon/svg?seed=sysxplore",
        fallback: "SX",
        verified: true,
        bio: "Everything about Linux 🐧, DevOps, Automation, sysadmin 🐱 💻 & beginner tips 💡 ...",
        followersCount: "90.7K followers",
        mutualFollowers: [
          { avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=mut6", alt: "Follower 6" },
        ],
        isFollowing: false,
      },
      {
        id: "sug-5",
        username: "prlshell",
        displayName: "Prlshell | Praktisi Fre...",
        avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=prlshell",
        fallback: "PS",
        verified: false,
        bio: "Bantu 500+ builders cuan dari AI & freelance 💸\nBedah AI tools, tools gratis, side...",
        followersCount: "9,950 followers",
        isFollowing: false,
      },
    ],
    []
  )

  const [suggestions, setSuggestions] = React.useState<FollowSuggestion[]>(
    initialSuggestions ?? defaultSuggestions
  )

  const handleToggleFollow = (id: string) => {
    setSuggestions((prev) =>
      prev.map((sug) =>
        sug.id === id ? { ...sug, isFollowing: !sug.isFollowing } : sug
      )
    )
  }

  const filteredSuggestions = React.useMemo(() => {
    if (!searchQuery.trim()) return suggestions
    const q = searchQuery.toLowerCase()
    return suggestions.filter(
      (sug) =>
        sug.username.toLowerCase().includes(q) ||
        sug.displayName?.toLowerCase().includes(q) ||
        sug.bio.toLowerCase().includes(q)
    )
  }, [suggestions, searchQuery])

  return (
    <aside
      className={cn(
        "w-82.5 shrink-0 h-screen hidden xl:flex flex-col select-none",
        className
      )}
    >
      <ScrollArea className="h-full px-4 pt-5 pb-6 no-scrollbar [&_[data-slot=scroll-area-scrollbar]]:hidden [&_[data-slot=scroll-area-viewport]]:no-scrollbar">
        <div className="flex flex-col gap-5">
          {/* Top Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Section: Follow suggestions */}
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-foreground tracking-tight pb-1">
              Follow suggestions
            </h2>

            <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-900/60">
              {filteredSuggestions.map((suggestion) => (
                <FollowItem
                  key={suggestion.id}
                  suggestion={suggestion}
                  onToggleFollow={handleToggleFollow}
                />
              ))}
              {filteredSuggestions.length === 0 && (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  No suggestions found
                </p>
              )}
            </div>
          </div>

          {/* Legal / Copyright Footer */}
          <HomeFooter />
        </div>
      </ScrollArea>
    </aside>
  )
}
