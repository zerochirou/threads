"use client";

import useSWR, { useSWRConfig } from "swr";
import { swrFetcher } from "../../../lib/fetcher.ts";
import {
  applyOptimisticLikeToPosts,
  prependCreatedPostToFeed,
  threadsKeys,
  toggleThreadLikeRequest,
  type ThreadsListResponse,
} from "../../content-scrollbar/services/threads-service.ts";
import {
  isUserFollowCacheKey,
  toggleUserFollowRequest,
} from "../../home/services/suggestions-service.ts";
import type { ThreadPostItem } from "../../content-scrollbar/types.ts";
import type { FollowerUserItem, ProfileUser } from "../types.ts";

export interface SessionUserLike {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  bio?: string | null;
  image?: string | null;
  verified?: boolean | null;
  hasFollowBadge?: boolean | null;
  isPrivate?: boolean | null;
  showInstagramBadge?: boolean | null;
  showRecentViews?: boolean | null;
  podcastUrl?: string | null;
  interests?: string | null;
}

export interface ProfileUserResponse {
  user: ProfileUser;
}

export interface ProfileConnectionsResponse {
  followers: FollowerUserItem[];
  following: FollowerUserItem[];
  followersCount: number;
  followingCount: number;
}

export const profileKeys = {
  userByUsername: (username?: string | null) =>
    username && username.trim()
      ? `/api/users/profile/${encodeURIComponent(username.trim().replace(/^@/, ""))}`
      : null,
  connectionsByUsername: (username?: string | null) =>
    username && username.trim()
      ? `/api/users/profile/${encodeURIComponent(username.trim().replace(/^@/, ""))}/connections`
      : null,
  threadsByAuthor: (params: {
    authorId?: string | null;
    username?: string | null;
  }) => threadsKeys.byAuthor(params),
};

export function resolveProfileUser(params: {
  initialUser?: ProfileUser;
  liveUser?: ProfileUser | null;
  authUser?: SessionUserLike | null;
  overrides?: Partial<ProfileUser>;
}): ProfileUser {
  const { initialUser, liveUser, authUser, overrides = {} } = params;

  const baseTarget = liveUser ?? initialUser;
  if (baseTarget) {
    const mergedBase: ProfileUser = {
      ...(initialUser ?? {}),
      ...baseTarget,
    };
    const isSelf = authUser
      ? authUser.id === mergedBase.id
      : Boolean(mergedBase.isSelf);
    return {
      ...mergedBase,
      isSelf,
      ...overrides,
    };
  }

  if (authUser) {
    const derivedUsername =
      authUser.username ||
      authUser.email
        ?.split("@")[0]
        ?.toLowerCase()
        .replace(/[^a-z0-9_.]/g, "") ||
      "user";
    const parsedCommunities = authUser.interests
      ? authUser.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const baseFromSession: ProfileUser = {
      id: authUser.id,
      email: authUser.email ?? undefined,
      name: authUser.name || derivedUsername,
      username: derivedUsername,
      bio: authUser.bio ?? "",
      avatarUrl:
        authUser.image ||
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(derivedUsername)}`,
      followersCount: 0,
      followingCount: 0,
      followerAvatars: [],
      communities: parsedCommunities,
      verified: authUser.verified ?? false,
      hasFollowBadge: authUser.hasFollowBadge ?? false,
      isPrivate: authUser.isPrivate ?? false,
      showInstagramBadge: authUser.showInstagramBadge ?? false,
      showRecentViews: authUser.showRecentViews ?? false,
      podcastUrl: authUser.podcastUrl ?? undefined,
      interests: authUser.interests ?? undefined,
      isSelf: true,
    };

    return { ...baseFromSession, ...overrides };
  }

  return {
    name: "User",
    username: "user",
    avatarUrl: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=user",
    followersCount: 0,
    followingCount: 0,
    followerAvatars: [],
    isSelf: false,
    ...overrides,
  };
}

export function computeNextFollowProfileState(
  currentFollowing: boolean,
  currentFollowersCount: number
) {
  const nextFollowing = !currentFollowing;
  const nextFollowersCount = Math.max(
    0,
    (currentFollowersCount || 0) + (nextFollowing ? 1 : -1)
  );
  return { nextFollowing, nextFollowersCount };
}

export function applyOptimisticFollowToConnections(
  connections: ProfileConnectionsResponse,
  userId: string,
  explicitState?: boolean
): ProfileConnectionsResponse {
  const updateList = (list: FollowerUserItem[]) =>
    list.map((item) => {
      if (item.id !== userId) return item;
      return {
        ...item,
        isFollowing:
          typeof explicitState === "boolean"
            ? explicitState
            : !item.isFollowing,
      };
    });

  return {
    ...connections,
    followers: updateList(connections.followers),
    following: updateList(connections.following),
  };
}

export function useProfileUser(params: {
  username?: string | null;
  initialUser?: ProfileUser;
}) {
  const key = profileKeys.userByUsername(params.username);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<ProfileUserResponse>(
      key,
      (url: string) => swrFetcher<ProfileUserResponse>(url),
      {
        fallbackData: params.initialUser
          ? { user: params.initialUser }
          : undefined,
      }
    );

  return {
    user: data?.user ?? params.initialUser,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

export function useProfileConnections(params: {
  username?: string | null;
  enabled?: boolean;
}) {
  const { mutate: globalMutate } = useSWRConfig();
  const shouldFetch = params.enabled !== false;
  const key = shouldFetch
    ? profileKeys.connectionsByUsername(params.username)
    : null;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<ProfileConnectionsResponse>(
      key,
      (url: string) => swrFetcher<ProfileConnectionsResponse>(url)
    );

  const toggleFollowInList = async (userId: string) => {
    const emptyState: ProfileConnectionsResponse = {
      followers: [],
      following: [],
      followersCount: 0,
      followingCount: 0,
    };

    await mutate(
      (current) =>
        applyOptimisticFollowToConnections(current ?? data ?? emptyState, userId),
      { revalidate: false }
    );

    try {
      const result = await toggleUserFollowRequest(userId);
      if (result && typeof result.isFollowing === "boolean") {
        await mutate(
          (current) =>
            applyOptimisticFollowToConnections(
              current ?? data ?? emptyState,
              userId,
              result.isFollowing
            ),
          { revalidate: false }
        );
        await globalMutate(
          (cacheKey) => isUserFollowCacheKey(cacheKey) && cacheKey !== key
        );
        return result.isFollowing;
      }
    } catch {
      await mutate();
    }
    return null;
  };

  return {
    followers: data?.followers ?? [],
    following: data?.following ?? [],
    followersCount: data?.followersCount,
    followingCount: data?.followingCount,
    isLoading,
    isValidating,
    error,
    mutate,
    toggleFollowInList,
  };
}

export function useProfileThreads(params: {
  authorId?: string | null;
  username?: string | null;
  initialPosts?: ThreadPostItem[];
  initialReplies?: ThreadPostItem[];
}) {
  const { mutate: globalMutate } = useSWRConfig();
  const key = profileKeys.threadsByAuthor({
    authorId: params.authorId,
    username: params.username,
  });

  const fallbackData: ThreadsListResponse | undefined =
    params.initialPosts || params.initialReplies
      ? {
          posts: params.initialPosts ?? [],
          userReplies: params.initialReplies ?? [],
        }
      : undefined;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<ThreadsListResponse>(
      key,
      (url: string) => swrFetcher<ThreadsListResponse>(url),
      {
        fallbackData,
      }
    );

  const posts = data?.posts ?? params.initialPosts ?? [];
  const replies = data?.userReplies ?? params.initialReplies ?? [];

  const toggleLike = async (postId: string) => {
    await mutate(
      (current) => ({
        posts: applyOptimisticLikeToPosts(current?.posts ?? posts, postId),
        userReplies: applyOptimisticLikeToPosts(
          current?.userReplies ?? replies,
          postId
        ),
      }),
      { revalidate: false }
    );

    try {
      const result = await toggleThreadLikeRequest(postId);
      if (result) {
        await mutate(
          (current) => ({
            posts: applyOptimisticLikeToPosts(
              current?.posts ?? posts,
              postId,
              result
            ),
            userReplies: applyOptimisticLikeToPosts(
              current?.userReplies ?? replies,
              postId,
              result
            ),
          }),
          { revalidate: false }
        );
        await globalMutate(threadsKeys.feed());
      }
    } catch {
      await mutate();
    }
  };

  const prependPost = async (newPost: ThreadPostItem) => {
    await mutate(
      (current) => ({
        posts: prependCreatedPostToFeed(current?.posts ?? posts, newPost),
        userReplies: current?.userReplies ?? replies,
      }),
      { revalidate: false }
    );
  };

  const removePost = async (postId: string) => {
    await mutate(
      (current) => ({
        posts: (current?.posts ?? posts).filter((p) => p.id !== postId),
        userReplies: (current?.userReplies ?? replies).filter((p) => p.id !== postId),
      }),
      { revalidate: false }
    );
  };

  return {
    posts,
    replies,
    isLoading,
    isValidating,
    error,
    mutate,
    toggleLike,
    prependPost,
    removePost,
  };
}

export function useProfileFollowMutation() {
  const { mutate: globalMutate } = useSWRConfig();

  const toggleFollowUser = async (targetUserId: string) => {
    const result = await toggleUserFollowRequest(targetUserId);
    if (result && typeof result.isFollowing === "boolean") {
      await globalMutate((cacheKey) => isUserFollowCacheKey(cacheKey));
      return result.isFollowing;
    }
    return null;
  };

  return { toggleFollowUser };
}
