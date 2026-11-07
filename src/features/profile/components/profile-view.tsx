"use client";

import * as React from "react";
import Link from "next/link";
import { ProfileHeaderNav } from "./profile-header-nav";
import { ProfileBio } from "./profile-bio";
import { ProfileTabsSection } from "./profile-tabs-section";
import { FollowersDialog } from "./followers-dialog";
import { EditProfileDialog } from "./edit-profile-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import {
  computeNextFollowProfileState,
  resolveProfileUser,
  useProfileFollowMutation,
  useProfileThreads,
  useProfileUser,
} from "../services/profile-service";
import type { ProfileUser } from "../types";
import type { ThreadPostItem } from "@/features/content-scrollbar/types";
import { cn } from "@/lib/utils";

export interface ProfileViewProps {
  user?: ProfileUser;
  posts?: ThreadPostItem[];
  replies?: ThreadPostItem[];
  className?: string;
}

export function ProfileView({
  user: initialUser,
  posts: initialPosts,
  replies: initialReplies,
  className,
}: ProfileViewProps) {
  const { data: sessionData, isPending: isSessionPending, error: sessionError } = useSession();

  const [userOverrides, setUserOverrides] = React.useState<Partial<ProfileUser>>({});
  const [isFollowersOpen, setIsFollowersOpen] = React.useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);
  const { toggleFollowUser } = useProfileFollowMutation();

  const preliminaryUser = React.useMemo(
    () =>
      resolveProfileUser({
        initialUser,
        authUser: sessionData?.user,
      }),
    [initialUser, sessionData?.user]
  );

  const { user: liveUser, mutate: mutateProfileUser } = useProfileUser({
    username: preliminaryUser.username !== "user" || initialUser ? preliminaryUser.username : null,
    initialUser,
  });

  const resolvedUser: ProfileUser = React.useMemo(
    () =>
      resolveProfileUser({
        initialUser,
        liveUser,
        authUser: sessionData?.user,
        overrides: userOverrides,
      }),
    [initialUser, liveUser, sessionData?.user, userOverrides]
  );

  const isFollowing = Boolean(resolvedUser.isFollowing);

  const {
    posts: userPosts,
    replies: userReplies,
    toggleLike: handleToggleLike,
    prependPost,
    removePost,
    mutate: mutateProfileThreads,
  } = useProfileThreads({
    authorId: resolvedUser.id,
    username: resolvedUser.username,
    initialPosts,
    initialReplies,
  });

  const handleProfileSave = (updated: Partial<ProfileUser>) => {
    setUserOverrides((prev) => ({ ...prev, ...updated }));
    void mutateProfileUser();
  };

  const handleToggleFollow = async () => {
    if (!resolvedUser.id) return;
    const { nextFollowing, nextFollowersCount } = computeNextFollowProfileState(
      isFollowing,
      resolvedUser.followersCount || 0
    );

    await mutateProfileUser(
      (current) => ({
        user: {
          ...(current?.user ?? resolvedUser),
          isFollowing: nextFollowing,
          followersCount: nextFollowersCount,
        },
      }),
      { revalidate: false }
    );

    try {
      const serverFollowing = await toggleFollowUser(resolvedUser.id);
      if (typeof serverFollowing === "boolean") {
        await mutateProfileUser();
      }
    } catch {
      await mutateProfileUser();
    }
  };

  React.useEffect(() => {
    const authorId = resolvedUser.id;
    const username = resolvedUser.username;

    const handlePostCreated = (event: Event) => {
      const customEvent = event as CustomEvent<ThreadPostItem>;
      const newPost = customEvent.detail;
      if (!newPost) return;
      if (
        (authorId && newPost.author.id === authorId) ||
        newPost.author.username === username
      ) {
        void prependPost(newPost);
      }
    };

    const handleReplyCreated = () => {
      void mutateProfileThreads();
    };

    const handleThreadDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<{ threadId: string }>;
      const deletedId = customEvent.detail?.threadId;
      if (!deletedId) return;
      void removePost(deletedId);
    };

    window.addEventListener("threads:post-created", handlePostCreated);
    window.addEventListener("threads:reply-created", handleReplyCreated);
    window.addEventListener("threads:thread-deleted", handleThreadDeleted);
    return () => {
      window.removeEventListener("threads:post-created", handlePostCreated);
      window.removeEventListener("threads:reply-created", handleReplyCreated);
      window.removeEventListener("threads:thread-deleted", handleThreadDeleted);
    };
  }, [
    resolvedUser.id,
    resolvedUser.username,
    prependPost,
    removePost,
    mutateProfileThreads,
  ]);

  const userFallback = (resolvedUser.name || resolvedUser.username || "U")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <ScrollArea
        className={cn(
          "h-dvh w-full max-w-167 mx-auto px-0 md:px-4 pt-1 md:py-2",
          "no-scrollbar **:data-[slot=scroll-area-scrollbar]:hidden **:data-[slot=scroll-area-viewport]:no-scrollbar",
          className
        )}
      >
        <div className="flex flex-col gap-1.5 md:gap-3 pb-24">
          <ProfileHeaderNav
            username={resolvedUser.username}
            isSelf={resolvedUser.isSelf}
          />

          {isSessionPending && !initialUser ? (
            <div className="w-full py-12 px-6 md:rounded-2xl border-y md:border border-neutral-200/90 dark:border-neutral-800/80 text-center text-sm text-neutral-500 dark:text-neutral-400">
              Loading profile...
            </div>
          ) : sessionError && !initialUser ? (
            <div className="w-full py-8 px-6 md:rounded-2xl border-y md:border border-red-500/30 bg-red-500/5 text-center flex flex-col items-center gap-2">
              <p className="text-sm text-red-500 dark:text-red-400 font-medium">
                Could not load session details.
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Refresh the page or sign in again to sync your profile.
              </p>
            </div>
          ) : null}

          {!isSessionPending && !sessionData?.user && !initialUser && (
            <div className="mx-3 md:mx-0 px-4 sm:px-5 py-3.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Viewing guest profile preview
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Sign in with your account to load and edit your own profile.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href="/signin" />}
                  className="h-9 sm:h-8 rounded-full px-3.5 text-xs font-semibold cursor-pointer"
                >
                  Log in
                </Button>
                <Button
                  size="sm"
                  render={<Link href="/signup" />}
                  className="h-9 sm:h-8 rounded-full px-3.5 text-xs font-semibold cursor-pointer"
                >
                  Sign up
                </Button>
              </div>
            </div>
          )}

          <div className="w-full py-2 md:py-3 md:rounded-2xl border-y md:border border-neutral-200/90 dark:border-neutral-800/80 text-card-foreground shadow-xs overflow-hidden">
            <ProfileBio
              user={resolvedUser}
              onEditProfile={() => setIsEditProfileOpen(true)}
              onFollowersClick={() => setIsFollowersOpen(true)}
              onToggleFollow={handleToggleFollow}
              isFollowing={isFollowing}
            />

            <ProfileTabsSection
              userAvatarUrl={resolvedUser.avatarUrl}
              userFallback={userFallback}
              userName={resolvedUser.username}
              posts={userPosts}
              replies={userReplies}
              onToggleLike={handleToggleLike}
              onDeleted={removePost}
            />
          </div>
        </div>
      </ScrollArea>

      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        user={resolvedUser}
        onSave={handleProfileSave}
      />

      <FollowersDialog
        open={isFollowersOpen}
        onOpenChange={setIsFollowersOpen}
        username={resolvedUser.username}
        followersCount={resolvedUser.followersCount}
        followingCount={resolvedUser.followingCount ?? 0}
      />
    </>
  );
}
