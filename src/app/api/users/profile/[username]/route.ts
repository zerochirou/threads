import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getAuth } from "@/lib/auth";
import {
  escapeSqlLikePattern,
  stripSensitivePublicUserFields,
} from "@/lib/security";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username: rawUsername } = await context.params;
    const username = decodeURIComponent(rawUsername).replace(/^@/, "").trim().toLowerCase();
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

    const [followersCountResult, followingCountResult, recentFollowerEdges] =
      await Promise.all([
        db
          .select({ count: sql<number>`count(*)` })
          .from(schema.follows)
          .where(eq(schema.follows.followingId, targetUser.id)),
        db
          .select({ count: sql<number>`count(*)` })
          .from(schema.follows)
          .where(eq(schema.follows.followerId, targetUser.id)),
        db
          .select({ followerId: schema.follows.followerId })
          .from(schema.follows)
          .where(eq(schema.follows.followingId, targetUser.id))
          .orderBy(desc(schema.follows.createdAt))
          .limit(3),
      ]);

    const followersCount = Number(followersCountResult[0]?.count ?? 0);
    const followingCount = Number(followingCountResult[0]?.count ?? 0);

    const recentFollowerIds = recentFollowerEdges.map((row) => row.followerId);
    const followerAvatars: string[] = [];
    if (recentFollowerIds.length > 0) {
      const followerUsers = await db
        .select({
          id: schema.user.id,
          username: schema.user.username,
          email: schema.user.email,
          image: schema.user.image,
        })
        .from(schema.user)
        .where(inArray(schema.user.id, recentFollowerIds));

      for (const fUser of followerUsers) {
        const fUsername =
          fUser.username ||
          fUser.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_.]/g, "") ||
          "user";
        followerAvatars.push(
          fUser.image ||
            `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(fUsername)}`
        );
      }
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== targetUser.id) {
      const followRecord = await db.query.follows.findFirst({
        where: and(
          eq(schema.follows.followerId, currentUserId),
          eq(schema.follows.followingId, targetUser.id)
        ),
      });
      isFollowing = Boolean(followRecord);
    }

    const resolvedUsername =
      targetUser.username ||
      targetUser.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_.]/g, "") ||
      "user";
    const displayName = targetUser.name || resolvedUsername;

    const communities = targetUser.interests
      ? targetUser.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const isSelf = currentUserId === targetUser.id;
    const profilePayload = stripSensitivePublicUserFields(
      {
        id: targetUser.id,
        email: targetUser.email,
        name: displayName,
        username: resolvedUsername,
        bio: targetUser.bio || "",
        avatarUrl:
          targetUser.image ||
          `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(resolvedUsername)}`,
        followersCount,
        followingCount,
        followerAvatars,
        communities,
        verified: Boolean(targetUser.verified),
        hasFollowBadge: Boolean(targetUser.hasFollowBadge),
        isPrivate: Boolean(targetUser.isPrivate),
        showInstagramBadge: Boolean(targetUser.showInstagramBadge),
        showRecentViews: Boolean(targetUser.showRecentViews),
        podcastUrl: targetUser.podcastUrl || undefined,
        interests: targetUser.interests || undefined,
        isFollowing,
        isSelf,
      },
      isSelf
    );

    return NextResponse.json({
      user: profilePayload,
    });
  } catch (error) {
    console.error("Error fetching public user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
