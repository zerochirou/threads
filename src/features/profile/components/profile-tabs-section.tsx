"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PostComposer } from "@/features/composer"
import { FinishProfileCards } from "./finish-profile-cards"
import { ThreadCard } from "@/features/content-scrollbar"
import type { ThreadPostItem } from "@/features/content-scrollbar/types"
import { cn } from "@/lib/utils"

export interface ProfileTabsSectionProps {
  userAvatarUrl?: string
  userFallback?: string
  posts?: ThreadPostItem[]
  className?: string
}

export function ProfileTabsSection({
  userAvatarUrl = "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=threads-user",
  userFallback = "ZC",
  posts = [],
  className,
}: ProfileTabsSectionProps) {
  return (
    <div className={cn("w-full flex flex-col", className)}>
      <Tabs defaultValue="threads" className="w-full gap-0">
        
        <div className="border-b border-neutral-200/80 dark:border-neutral-800">
          <TabsList
            variant="line"
            className="w-full h-12 p-0 justify-around rounded-none bg-transparent"
          >
            <TabsTrigger
              value="threads"
              className="flex-1 h-full font-bold text-sm text-neutral-500 data-active:text-neutral-900 dark:data-active:text-white rounded-none cursor-pointer after:bottom-0 after:h-[1.5px]"
            >
              Threads
            </TabsTrigger>
            <TabsTrigger
              value="replies"
              className="flex-1 h-full font-bold text-sm text-neutral-500 data-active:text-neutral-900 dark:data-active:text-white rounded-none cursor-pointer after:bottom-0 after:h-[1.5px]"
            >
              Replies
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="flex-1 h-full font-bold text-sm text-neutral-500 data-active:text-neutral-900 dark:data-active:text-white rounded-none cursor-pointer after:bottom-0 after:h-[1.5px]"
            >
              Media
            </TabsTrigger>
            <TabsTrigger
              value="reposts"
              className="flex-1 h-full font-bold text-sm text-neutral-500 data-active:text-neutral-900 dark:data-active:text-white rounded-none cursor-pointer after:bottom-0 after:h-[1.5px]"
            >
              Reposts
            </TabsTrigger>
          </TabsList>
        </div>

        
        <TabsContent value="threads" className="flex flex-col m-0 outline-none">
          
          <div className="border-b border-neutral-200/80 dark:border-neutral-800">
            <PostComposer
              userAvatarUrl={userAvatarUrl}
              userFallback={userFallback}
              userName="zerochirou"
            />
          </div>

          
          <FinishProfileCards remainingCount={1} />

          
          {posts.length > 0 && (
            <div className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
              {posts.map((post) => (
                <ThreadCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>

        
        <TabsContent
          value="replies"
          className="p-12 text-center text-sm text-neutral-500 dark:text-neutral-400 m-0"
        >
          No replies yet
        </TabsContent>

        
        <TabsContent
          value="media"
          className="p-12 text-center text-sm text-neutral-500 dark:text-neutral-400 m-0"
        >
          No media yet
        </TabsContent>

        
        <TabsContent
          value="reposts"
          className="p-12 text-center text-sm text-neutral-500 dark:text-neutral-400 m-0"
        >
          No reposts yet
        </TabsContent>
      </Tabs>
    </div>
  )
}
