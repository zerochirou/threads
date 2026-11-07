import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, not, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getAuth } from "@/lib/auth";
import type { FollowSuggestion } from "@/features/home/types";

function formatFollowersCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M followers`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K followers`;
  if (count === 1) return "1 follower";
  return `${count} followers`;
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const currentUserId = session?.user?.id ?? null;

    const usersQuery = currentUserId
      ? await db
          .select()
          .from(schema.user)
          .where(not(eq(schema.user.id, currentUserId)))
          .orderBy(desc(schema.user.createdAt))
          .limit(20)
      : await db
          .select()
          .from(schema.user)
          .orderBy(desc(schema.user.createdAt))
          .limit(20);

    const userIds = usersQuery.map((u) => u.id);

    const followedUserIds = new Set<string>();
    if (currentUserId && userIds.length > 0) {
      const followRows = await db
        .select({ followingId: schema.follows.followingId })
        .from(schema.follows)
        .where(
          and(
            eq(schema.follows.followerId, currentUserId),
            inArray(schema.follows.followingId, userIds)
          )
        );
      for (const row of followRows) {
        followedUserIds.add(row.followingId);
      }
    }

    const followerCounts = new Map<string, number>();
    if (userIds.length > 0) {
      const counts = await db
        .select({
          userId: schema.follows.followingId,
          count: sql<number>`count(*)`,
        })
        .from(schema.follows)
        .where(inArray(schema.follows.followingId, userIds))
        .groupBy(schema.follows.followingId);

      for (const c of counts) {
        followerCounts.set(c.userId, Number(c.count));
      }
    }

    const suggestions: FollowSuggestion[] = usersQuery.map((u) => {
      const username =
        u.username ||
        u.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_.]/g, "") ||
        "user";
      const displayName = u.name || username;
      const count = followerCounts.get(u.id) ?? 0;

      return {
        id: u.id,
        username,
        displayName,
        avatarUrl:
          u.image ||
          `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(username)}`,
        fallback: displayName.slice(0, 2).toUpperCase(),
        verified: Boolean(u.verified),
        bio: u.bio || (u.interests ? `Interests: ${u.interests}` : ""),
        followersCount: formatFollowersCount(count),
        isFollowing: followedUserIds.has(u.id),
      };
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error fetching follow suggestions:", error);
    return NextResponse.json(
      { error: "Failed to load follow suggestions." },
      { status: 500 }
    );
  }
}
