import { headers } from "next/headers";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { Sidebar } from "@/features/commons";
import { FollowSuggestions } from "@/features/home";
import { ProfileView, type ProfileUser } from "@/features/profile";
import { getDb, schema } from "@/db";
import { getAuth } from "@/lib/auth";

export default async function ProfilePage() {
  let initialUser: ProfileUser | undefined;

  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user) {
      const u = session.user;
      const derivedUsername =
        u.username ||
        u.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_.]/g, "") ||
        "user";

      const db = await getDb();
      const [followersCountResult, followingCountResult, recentFollowerEdges] =
        await Promise.all([
          db
            .select({ count: sql<number>`count(*)` })
            .from(schema.follows)
            .where(eq(schema.follows.followingId, u.id)),
          db
            .select({ count: sql<number>`count(*)` })
            .from(schema.follows)
            .where(eq(schema.follows.followerId, u.id)),
          db
            .select({ followerId: schema.follows.followerId })
            .from(schema.follows)
            .where(eq(schema.follows.followingId, u.id))
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

      initialUser = {
        id: u.id,
        email: u.email,
        name: u.name || derivedUsername,
        username: derivedUsername,
        bio: u.bio || "",
        avatarUrl:
          u.image ||
          `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(derivedUsername)}`,
        followersCount,
        followingCount,
        followerAvatars,
        communities: u.interests
          ? u.interests
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        verified: u.verified ?? false,
        hasFollowBadge: u.hasFollowBadge ?? false,
        isPrivate: u.isPrivate ?? false,
        showInstagramBadge: u.showInstagramBadge ?? false,
        showRecentViews: u.showRecentViews ?? false,
        podcastUrl: u.podcastUrl ?? undefined,
        interests: u.interests ?? undefined,
        isSelf: true,
      };
    }
  } catch {
    // Fallback to client-side session resolution if server context is unavailable
  }

  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="hidden md:flex md:flex-1 justify-start">
        <Sidebar className="sticky top-0" />
      </div>

      <main className="w-full max-w-[668px] shrink-0 overflow-x-hidden">
        <ProfileView user={initialUser} />
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

