"use client"

import * as React from "react"
import type { FollowSuggestion } from "../types"
import {
  filterFollowSuggestions,
  useFollowSuggestions,
} from "../services/suggestions-service"
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
  const { suggestions, toggleFollow } = useFollowSuggestions(initialSuggestions)

  const filteredSuggestions = React.useMemo(
    () => filterFollowSuggestions(suggestions, searchQuery),
    [suggestions, searchQuery]
  )

  return (
    <aside
      className={cn(
        "w-82.5 shrink-0 h-screen hidden xl:flex flex-col",
        className
      )}
    >
      <ScrollArea
        className={cn(
          "flex-1 w-full pl-6 pr-4 pt-4",
          "no-scrollbar **:data-[slot=scroll-area-scrollbar]:hidden **:data-[slot=scroll-area-viewport]:no-scrollbar"
        )}
      >
        <div className="flex flex-col pb-16">
          <div className="mb-4">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
            />
          </div>

          {filteredSuggestions.length > 0 && (
            <div className="rounded-2xl  bg-neutral-50/50 dark:bg-transparent p-4">
              <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2 px-1">
                Suggested for you
              </h2>

              <div className="flex flex-col">
                {filteredSuggestions.map((item) => (
                  <FollowItem
                    key={item.id}
                    suggestion={item}
                    onToggleFollow={toggleFollow}
                  />
                ))}
              </div>
            </div>
          )}

          <HomeFooter className="mt-8 px-1" />
        </div>
      </ScrollArea>
    </aside>
  )
}
