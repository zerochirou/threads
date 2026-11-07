import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Sidebar } from "@/features/commons";
import { FollowSuggestions } from "@/features/home";
import { ProfileView, type ProfileUser } from "@/features/profile";
import { getAuth } from "@/lib/auth";
import { getDb, schema } from "@/db";
import {
  escapeSqlLikePattern,
  stripSensitivePublicUserFields,
} from "@/lib/security";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "").trim().toLowerCase();
  const safeLikeUsername = escapeSqlLikePattern(username);

  let targetUser: ProfileUser | undefined;

  try {
    const db = await getDb();
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const currentUserId = session?.user?.id ?? null;

    const dbUser = await db.query.user.findFirst({
      where: or(
        eq(sql`lower(${schema.user.username})`, username),
        sql`lower(${schema.user.email}) LIKE ${`${safeLikeUsername}@%`} ESCAPE '\\'`,
        eq(schema.user.id, username)
      ),
    });

    if (!dbUser) {
      notFound();
    }

    const [followersCountResult, followingCountResult, recentFollowerEdges] =
      await Promise.all([
        db
          .select({ count: sql<number>`count(*)` })
          .from(schema.follows)
          .where(eq(schema.follows.followingId, dbUser.id)),
        db
          .select({ count: sql<number>`count(*)` })
          .from(schema.follows)
          .where(eq(schema.follows.followerId, dbUser.id)),
        db
          .select({ followerId: schema.follows.followerId })
          .from(schema.follows)
          .where(eq(schema.follows.followingId, dbUser.id))
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
    if (currentUserId && currentUserId !== dbUser.id) {
      const followRecord = await db.query.follows.findFirst({
        where: and(
          eq(schema.follows.followerId, currentUserId),
          eq(schema.follows.followingId, dbUser.id)
        ),
      });
      isFollowing = Boolean(followRecord);
    }

    const resolvedUsername =
      dbUser.username ||
      dbUser.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_.]/g, "") ||
      "user";
    const displayName = dbUser.name || resolvedUsername;

    const communities = dbUser.interests
      ? dbUser.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const isSelf = currentUserId === dbUser.id;
    targetUser = stripSensitivePublicUserFields(
      {
        id: dbUser.id,
        email: dbUser.email,
        name: displayName,
        username: resolvedUsername,
        bio: dbUser.bio || "",
        avatarUrl:
          dbUser.image ||
          `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(resolvedUsername)}`,
        followersCount,
        followingCount,
        followerAvatars,
        communities,
        verified: Boolean(dbUser.verified),
        hasFollowBadge: Boolean(dbUser.hasFollowBadge),
        isPrivate: Boolean(dbUser.isPrivate),
        showInstagramBadge: Boolean(dbUser.showInstagramBadge),
        showRecentViews: Boolean(dbUser.showRecentViews),
        podcastUrl: dbUser.podcastUrl || undefined,
        interests: dbUser.interests || undefined,
        isFollowing,
        isSelf,
      },
      isSelf
    );
  } catch (error) {
    console.error("Failed to fetch public profile:", error);
    notFound();
  }

  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="hidden md:flex md:flex-1 justify-start">
        <Sidebar className="sticky top-0" />
      </div>

      <main className="w-full max-w-[668px] shrink-0 overflow-x-hidden">
        <ProfileView user={targetUser} />
      </main>

      <div className="md:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 hidden xl:flex justify-end">
        <FollowSuggestions className="sticky top-0" />
      </div>
    </div>
  );
}
