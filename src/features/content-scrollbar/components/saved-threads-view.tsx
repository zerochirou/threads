"use client";

import * as React from "react";
import Link from "next/link";
import { RiBookmarkLine } from "@remixicon/react";
import type { ThreadPostItem } from "../types";
import { useSavedThreads } from "../services/threads-service";
import { FeedHeader } from "./feed-header";
import { ThreadCard } from "./thread-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export interface SavedThreadsViewProps {
  initialPosts?: ThreadPostItem[];
  className?: string;
}

export function SavedThreadsView({
  initialPosts = [],
  className,
}: SavedThreadsViewProps) {
  const { data: sessionData, isPending: isSessionPending } = useSession();
  const { posts, isLoading, toggleLike, toggleSave, mutate } = useSavedThreads(
    sessionData?.user?.id,
    initialPosts
  );

  React.useEffect(() => {
    const handleThreadDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<{ threadId: string }>;
      const deletedId = customEvent.detail?.threadId;
      if (!deletedId) return;
      void mutate(
        (current) => ({
          ...current,
          posts: (current?.posts ?? posts).filter((p) => p.id !== deletedId),
        }),
        { revalidate: false }
      );
    };

    window.addEventListener("threads:thread-deleted", handleThreadDeleted);
    return () => {
      window.removeEventListener("threads:thread-deleted", handleThreadDeleted);
    };
  }, [mutate, posts]);

  return (
    <ScrollArea
      className={cn(
        "h-dvh w-full max-w-[668px] mx-auto px-0 md:px-4 pt-2 md:py-4 select-none",
        "no-scrollbar **:data-[slot=scroll-area-scrollbar]:hidden **:data-[slot=scroll-area-viewport]:no-scrollbar",
        className
      )}
    >
      <div className="flex flex-col gap-2 md:gap-3 pb-24">
        <FeedHeader title="Saved" />

        <div className="w-full md:rounded-2xl border-y md:border border-neutral-200/90 dark:border-neutral-800/80 bg-card/30 text-card-foreground shadow-xs overflow-hidden divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
          {isLoading || isSessionPending ? (
            <div className="p-12 text-center text-sm text-neutral-500 dark:text-neutral-400 animate-pulse">
              Loading saved threads...
            </div>
          ) : !sessionData?.user ? (
            <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="size-12 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-500">
                <RiBookmarkLine className="size-6" />
              </div>
              <div className="flex flex-col gap-1 max-w-xs">
                <p className="text-sm font-semibold text-foreground">
                  Sign in to see your saved posts
                </p>
                <p className="text-xs text-muted-foreground">
                  Bookmark threads to read them later or keep them in your personal collection.
                </p>
              </div>
              <Button
                size="sm"
                render={<Link href="/signin" />}
                className="mt-1 rounded-full px-5 font-semibold cursor-pointer"
              >
                Log in
              </Button>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <ThreadCard
                key={post.id}
                post={post}
                onToggleLike={toggleLike}
                onToggleSave={toggleSave}
              />
            ))
          ) : (
            <div className="p-14 flex flex-col items-center justify-center text-center gap-2.5">
              <div className="size-11 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-400">
                <RiBookmarkLine className="size-5" />
              </div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                You haven&apos;t saved any threads yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
