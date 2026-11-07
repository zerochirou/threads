import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getAuth } from "@/lib/auth";
import {
  canViewPrivateProfileContent,
  escapeSqlLikePattern,
} from "@/lib/security";
import type { FollowerUserItem } from "@/features/profile/types";

function mapDbUserToFollowerItem(
  u: typeof schema.user.$inferSelect,
  followedIdsByCurrentUser: Set<string>,
  currentUserId: string | null
): FollowerUserItem {
  const username =
    u.username ||
    u.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_.]/g, "") ||
    "user";
  const fullName = u.name || username;

  return {
    id: u.id,
    username,
    fullName,
    avatarUrl:
      u.image ||
      `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(username)}`,
    verified: Boolean(u.verified),
    isFollowing: followedIdsByCurrentUser.has(u.id),
    isSelf: currentUserId === u.id,
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username: rawUsername } = await context.params;
    const username = decodeURIComponent(rawUsername)
      .replace(/^@/, "")
      .trim()
      .toLowerCase();
    const safeLikeUsername = escapeSqlLikePattern(username);

    const db = await getDb();
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const currentUserId = session?.user?.id ?? null;

    const targetUser = await db.query.user.findFirst({
      where: or(
        eq(sql`lower(${schema.user.username})`, username),
        sql`lower(${schema.user.email}) LIKE ${`${safeLikeUsername}@%`} ESCAPE '\\'`,
        eq(schema.user.id, username)
      ),
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isSelf = currentUserId === targetUser.id;
    let isFollowingTarget = false;
    if (currentUserId && !isSelf) {
      const followRecord = await db.query.follows.findFirst({
        where: and(
          eq(schema.follows.followerId, currentUserId),
          eq(schema.follows.followingId, targetUser.id)
        ),
      });
      isFollowingTarget = Boolean(followRecord);
    }

    if (
      !canViewPrivateProfileContent({
        isPrivate: Boolean(targetUser.isPrivate),
        isSelf,
        isFollowing: isFollowingTarget,
      })
    ) {
      return NextResponse.json({
        followers: [],
        following: [],
        followersCount: 0,
        followingCount: 0,
      });
    }

    const [followerEdges, followingEdges] = await Promise.all([
      db
        .select({
          userId: schema.follows.followerId,
          createdAt: schema.follows.createdAt,
        })
        .from(schema.follows)
        .where(eq(schema.follows.followingId, targetUser.id))
        .orderBy(desc(schema.follows.createdAt)),
      db
        .select({
          userId: schema.follows.followingId,
          createdAt: schema.follows.createdAt,
        })
        .from(schema.follows)
        .where(eq(schema.follows.followerId, targetUser.id))
        .orderBy(desc(schema.follows.createdAt)),
    ]);

    const followerIds = followerEdges.map((row) => row.userId);
    const followingIds = followingEdges.map((row) => row.userId);
    const allRelatedUserIds = Array.from(
      new Set([...followerIds, ...followingIds])
    );

    const usersMap = new Map<string, typeof schema.user.$inferSelect>();
    if (allRelatedUserIds.length > 0) {
      const userRows = await db
        .select()
        .from(schema.user)
        .where(inArray(schema.user.id, allRelatedUserIds));
      for (const row of userRows) {
        usersMap.set(row.id, row);
      }
    }

    const followedIdsByCurrentUser = new Set<string>();
    if (currentUserId && allRelatedUserIds.length > 0) {
      const viewerFollows = await db
        .select({ followingId: schema.follows.followingId })
        .from(schema.follows)
        .where(
          and(
            eq(schema.follows.followerId, currentUserId),
            inArray(schema.follows.followingId, allRelatedUserIds)
          )
        );
      for (const row of viewerFollows) {
        followedIdsByCurrentUser.add(row.followingId);
      }
    }

    const followers: FollowerUserItem[] = [];
    for (const id of followerIds) {
      const u = usersMap.get(id);
      if (u) {
        followers.push(
          mapDbUserToFollowerItem(u, followedIdsByCurrentUser, currentUserId)
        );
      }
    }

    const following: FollowerUserItem[] = [];
    for (const id of followingIds) {
      const u = usersMap.get(id);
      if (u) {
        following.push(
          mapDbUserToFollowerItem(u, followedIdsByCurrentUser, currentUserId)
        );
      }
    }

    return NextResponse.json({
      followers,
      following,
      followersCount: followers.length,
      followingCount: following.length,
    });
  } catch (error) {
    console.error("Error fetching profile connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile connections" },
      { status: 500 }
    );
  }
}
