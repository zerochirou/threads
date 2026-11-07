"use client";

import { useSWRConfig } from "swr";
import { isThreadsCacheKey } from "../../content-scrollbar/services/threads-service.ts";
import { isUserFollowCacheKey } from "../../home/services/suggestions-service.ts";

export function normalizeSignUpUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9_.]/g, "");
}

export function isEmailIdentifier(identifier: string): boolean {
  return identifier.trim().includes("@");
}

export function useAuthCacheSync() {
  const { mutate } = useSWRConfig();

  const clearAndRevalidateAuthCaches = async () => {
    await mutate(
      (key) => isThreadsCacheKey(key) || isUserFollowCacheKey(key),
      undefined,
      { revalidate: true }
    );
  };

  return { clearAndRevalidateAuthCaches };
}
