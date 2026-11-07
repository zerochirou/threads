import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, not, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getAuth } from "@/lib/auth";
import { escapeSqlLikePattern, sanitizeSearchQuery } from "@/lib/security";
import type { SearchUserItem } from "@/features/search/types";

function formatFollowersCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M followers`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K followers`;
  if (count === 1) return "1 follower";
  return `${count} followers`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = sanitizeSearchQuery(searchParams.get("q"));

    const db = await getDb();
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const currentUserId = session?.user?.id ?? null;

    let usersQuery;
    if (query.length > 0) {
      const escapedQuery = escapeSqlLikePattern(query.toLowerCase());
      const searchPattern = `%${escapedQuery}%`;
      const searchCondition = or(
        sql`lower(${schema.user.username}) LIKE ${searchPattern} ESCAPE '\\'`,
        sql`lower(${schema.user.name}) LIKE ${searchPattern} ESCAPE '\\'`,
        sql`lower(${schema.user.bio}) LIKE ${searchPattern} ESCAPE '\\'`
      );

      // Keep own account searchable when an explicit query is entered.
      usersQuery = await db
        .select()
        .from(schema.user)
        .where(searchCondition)
        .orderBy(desc(schema.user.createdAt))
        .limit(30);
    } else {
      // Exclude current user from default discovery suggestions.
      usersQuery = await db
        .select()
        .from(schema.user)
        .where(
          currentUserId ? not(eq(schema.user.id, currentUserId)) : undefined
        )
        .orderBy(desc(schema.user.createdAt))
        .limit(20);
    }

    const userIds = usersQuery.map((u) => u.id);

    // Follow status check
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

    // Followers count aggregation from real database follows table
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

    const results: SearchUserItem[] = usersQuery.map((u) => {
      const username =
        u.username ||
        u.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_.]/g, "") ||
        "user";
      const fullName = u.name || username;
      const count = followerCounts.get(u.id) ?? 0;

      return {
        id: u.id,
        username,
        fullName,
        bio: u.bio || undefined,
        avatarUrl:
          u.image ||
          `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(username)}`,
        fallback: fullName.slice(0, 2).toUpperCase(),
        verified: Boolean(u.verified),
        followersCountText: formatFollowersCount(count),
        isFollowing: followedUserIds.has(u.id),
        isSelf: currentUserId === u.id,
      };
    });

    return NextResponse.json({ users: results });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users." },
      { status: 500 }
    );
  }
}
