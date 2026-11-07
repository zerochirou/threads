"use client";

import * as React from "react";
import { SearchHeader } from "./search-header";
import { SearchResultItem } from "./search-result-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserSearch } from "../services/search-service";
import type { SearchUserItem } from "../types";
import { cn } from "@/lib/utils";

export interface SearchViewProps {
  initialUsers?: SearchUserItem[];
  className?: string;
}

export function SearchView({ initialUsers = [], className }: SearchViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { users, isLoading, toggleFollow } = useUserSearch(
    searchQuery,
    initialUsers
  );

  return (
    <ScrollArea
      className={cn(
        "h-dvh w-full max-w-[668px] mx-auto px-0 md:px-4 pt-2 md:py-4",
        "no-scrollbar **:data-[slot=scroll-area-scrollbar]:hidden **:data-[slot=scroll-area-viewport]:no-scrollbar",
        className,
      )}
    >
      <div className="flex flex-col pb-24">
        <div className="md:hidden px-4 pt-2 pb-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Search
          </h1>
        </div>

        <SearchHeader
          value={searchQuery}
          onChange={setSearchQuery}
          onFilterClick={() => {}}
          className="px-4 md:px-0"
        />

        <div className="w-full md:rounded-2xl border-y md:border border-neutral-200/90 dark:border-neutral-800/80 text-card-foreground shadow-xs overflow-hidden">
          <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
              {searchQuery.trim() ? "Search results" : "Follow suggestions"}
            </h2>
            {isLoading && (
              <span className="text-xs text-neutral-400 dark:text-neutral-500 animate-pulse">
                {searchQuery.trim() ? "Searching..." : "Loading..."}
              </span>
            )}
          </div>

          <div className="divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
            {users.length > 0 ? (
              users.map((user) => (
                <SearchResultItem
                  key={user.id}
                  user={user}
                  onToggleFollow={toggleFollow}
                />
              ))
            ) : !isLoading ? (
              <div className="p-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                {searchQuery.trim()
                  ? `No users found for "${searchQuery}"`
                  : "No suggestions available yet"}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
