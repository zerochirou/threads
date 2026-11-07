"use client";

import useSWR, { useSWRConfig } from "swr";
import { swrFetcher } from "../../../lib/fetcher.ts";
import type { FollowSuggestion } from "../types.ts";

export interface SuggestionsResponse {
  suggestions: FollowSuggestion[];
}

export interface ToggleFollowResponse {
  isFollowing?: boolean;
}

export const suggestionsKeys = {
  all: () => "/api/users/suggestions" as const,
};

export function isUserFollowCacheKey(key: unknown): key is string {
  return typeof key === "string" && key.startsWith("/api/users/");
}

export function formatFollowersCountLabel(count: number): string {
  const safeCount = Math.max(0, count);
  if (safeCount >= 1_000_000)
    return `${(safeCount / 1_000_000).toFixed(1)}M followers`;
  if (safeCount >= 1_000) return `${(safeCount / 1_000).toFixed(1)}K followers`;
  if (safeCount === 1) return "1 follower";
  return `${safeCount} followers`;
}

export function adjustFormattedFollowersCount(
  currentText: string | undefined,
  delta: number
): string | undefined {
  if (!currentText) return currentText;
  const match = currentText.match(/^(\d+)\s+follower/i);
  if (!match) return currentText;
  const parsed = Number.parseInt(match[1], 10);
  if (Number.isNaN(parsed)) return currentText;
  return formatFollowersCountLabel(parsed + delta);
}

export function applyOptimisticFollowToSuggestions(
  suggestions: FollowSuggestion[],
  userId: string,
  explicitState?: boolean
): FollowSuggestion[] {
  return suggestions.map((item) => {
    if (item.id !== userId) return item;
    const nextFollowing =
      typeof explicitState === "boolean" ? explicitState : !item.isFollowing;
    const delta =
      nextFollowing === Boolean(item.isFollowing) ? 0 : nextFollowing ? 1 : -1;
    return {
      ...item,
      isFollowing: nextFollowing,
      followersCount:
        delta !== 0
          ? (adjustFormattedFollowersCount(item.followersCount, delta) ??
            item.followersCount)
          : item.followersCount,
    };
  });
}

export function filterFollowSuggestions(
  suggestions: FollowSuggestion[],
  searchQuery: string
): FollowSuggestion[] {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return suggestions;
  return suggestions.filter(
    (sug) =>
      sug.username.toLowerCase().includes(q) ||
      sug.displayName?.toLowerCase().includes(q) ||
      sug.bio.toLowerCase().includes(q)
  );
}

export async function toggleUserFollowRequest(
  userId: string,
  fetchImpl: typeof fetch = fetch
): Promise<ToggleFollowResponse | null> {
  const response = await fetchImpl(
    `/api/users/${encodeURIComponent(userId)}/follow`,
    {
      method: "POST",
      credentials: "same-origin",
    }
  );
  if (!response.ok) return null;
  return (await response.json()) as ToggleFollowResponse;
}

export function useFollowSuggestions(
  initialSuggestions?: FollowSuggestion[]
) {
  const { mutate: globalMutate } = useSWRConfig();
  const key = suggestionsKeys.all();

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<SuggestionsResponse>(
      key,
      (url: string) => swrFetcher<SuggestionsResponse>(url),
      {
        fallbackData: initialSuggestions
          ? { suggestions: initialSuggestions }
          : undefined,
        dedupingInterval: 10000,
      }
    );

  const suggestions = data?.suggestions ?? initialSuggestions ?? [];

  const toggleFollow = async (userId: string) => {
    await mutate(
      (current) => ({
        suggestions: applyOptimisticFollowToSuggestions(
          current?.suggestions ?? suggestions,
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
            suggestions: applyOptimisticFollowToSuggestions(
              current?.suggestions ?? suggestions,
              userId,
              result.isFollowing
            ),
          }),
          { revalidate: false }
        );
        await globalMutate(
          (cacheKey) =>
            isUserFollowCacheKey(cacheKey) && cacheKey !== suggestionsKeys.all()
        );
      }
    } catch {
      await mutate();
    }
  };

  return {
    suggestions,
    isLoading,
    isValidating,
    error,
    mutate,
    toggleFollow,
  };
}
