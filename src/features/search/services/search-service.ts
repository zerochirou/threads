"use client";

import * as React from "react";
import useSWR, { useSWRConfig } from "swr";
import { swrFetcher } from "../../../lib/fetcher.ts";
import { sanitizeSearchQuery } from "../../../lib/security.ts";
import {
  adjustFormattedFollowersCount,
  isUserFollowCacheKey,
  toggleUserFollowRequest,
} from "../../home/services/suggestions-service.ts";
import type { SearchUserItem } from "../types.ts";

export interface SearchUsersResponse {
  users: SearchUserItem[];
}

export const searchKeys = {
  query: (rawQuery: string) => {
    const cleaned = sanitizeSearchQuery(rawQuery);
    return cleaned
      ? `/api/users/search?q=${encodeURIComponent(cleaned)}`
      : "/api/users/search";
  },
};

export function applyOptimisticFollowToSearchUsers(
  users: SearchUserItem[],
  userId: string,
  explicitState?: boolean
): SearchUserItem[] {
  return users.map((user) => {
    if (user.id !== userId) return user;
    const nextFollowing =
      typeof explicitState === "boolean" ? explicitState : !user.isFollowing;
    const delta =
      nextFollowing === Boolean(user.isFollowing) ? 0 : nextFollowing ? 1 : -1;
    return {
      ...user,
      isFollowing: nextFollowing,
      followersCountText:
        delta !== 0
          ? adjustFormattedFollowersCount(user.followersCountText, delta)
          : user.followersCountText,
    };
  });
}

export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function useUserSearch(
  searchQuery: string,
  initialUsers: SearchUserItem[] = []
) {
  const { mutate: globalMutate } = useSWRConfig();
  const debouncedQuery = useDebouncedValue(
    searchQuery,
    searchQuery.trim() ? 250 : 0
  );
  const key = searchKeys.query(debouncedQuery);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<SearchUsersResponse>(
      key,
      (url: string) => swrFetcher<SearchUsersResponse>(url),
      {
        fallbackData:
          !debouncedQuery.trim() && initialUsers.length > 0
            ? { users: initialUsers }
            : undefined,
        keepPreviousData: true,
      }
    );

  const users = data?.users ?? initialUsers;

  const toggleFollow = async (userId: string) => {
    await mutate(
      (current) => ({
        users: applyOptimisticFollowToSearchUsers(
          current?.users ?? users,
          userId
        ),
      }),
      { revalidate: false }
    );

    try {
      const result = await toggleUserFollowRequest(userId);
      if (result && typeof result.isFollowing === "boolean") {
        await mutate(
          (current) => ({
            users: applyOptimisticFollowToSearchUsers(
              current?.users ?? users,
              userId,
              result.isFollowing
            ),
          }),
          { revalidate: false }
        );
        await globalMutate(
          (cacheKey) => isUserFollowCacheKey(cacheKey) && cacheKey !== key
        );
      }
    } catch {
      await mutate();
    }
  };

  return {
    users,
    isLoading: isLoading || (isValidating && users.length === 0),
    isValidating,
    error,
    mutate,
    toggleFollow,
  };
}
