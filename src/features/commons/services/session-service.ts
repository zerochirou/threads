"use client";

import { useSWRConfig } from "swr";
import { signOut } from "../../../lib/auth-client.ts";
import { isThreadsCacheKey } from "../../content-scrollbar/services/threads-service.ts";
import { isUserFollowCacheKey } from "../../home/services/suggestions-service.ts";

export interface MobileBottomNavItem {
  id: "home" | "search" | "compose" | "liked" | "profile";
  label: string;
  href?: string;
  isAction?: boolean;
}

export function resolveMobileBottomNavItems(): MobileBottomNavItem[] {
  return [
    { id: "home", label: "Home", href: "/" },
    { id: "search", label: "Search", href: "/search" },
    { id: "compose", label: "New thread", isAction: true },
    { id: "liked", label: "Activity", href: "/liked" },
    { id: "profile", label: "Profile", href: "/profile" },
  ];
}

export function isMobileNavRouteActive(
  pathname: string,
  targetHref?: string
): boolean {
  if (!targetHref) return false;
  if (targetHref === "/") {
    return pathname === "/";
  }
  if (targetHref === "/liked") {
    return pathname.startsWith("/liked") || pathname.startsWith("/saved");
  }
  return pathname === targetHref || pathname.startsWith(`${targetHref}/`);
}

export function useSessionActions() {
  const { mutate } = useSWRConfig();

  const performSignOut = async () => {
    await signOut();
    await mutate(
      (key) => isThreadsCacheKey(key) || isUserFollowCacheKey(key),
      undefined,
      { revalidate: true }
    );
  };

  return { performSignOut };
}
