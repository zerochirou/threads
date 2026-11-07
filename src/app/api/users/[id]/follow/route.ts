import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getAuth } from "@/lib/auth";
import { isSameOriginMutation } from "@/lib/security";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSameOriginMutation(request.url, request.headers.get("origin"))) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 }
      );
    }

    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Sign in to follow users." },
        { status: 401 }
      );
    }

    const { id: targetUserId } = await context.params;
    const currentUserId = session.user.id;

    if (targetUserId === currentUserId) {
      return NextResponse.json(
        { error: "You cannot follow yourself." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const targetUser = await db.query.user.findFirst({
      where: eq(schema.user.id, targetUserId),
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const existingFollow = await db.query.follows.findFirst({
      where: and(
        eq(schema.follows.followerId, currentUserId),
        eq(schema.follows.followingId, targetUserId)
      ),
    });

    if (existingFollow) {
      await db
        .delete(schema.follows)
        .where(eq(schema.follows.id, existingFollow.id));

      return NextResponse.json({
        isFollowing: false,
      });
    } else {
      await db.insert(schema.follows).values({
        id: crypto.randomUUID(),
        followerId: currentUserId,
        followingId: targetUserId,
        status: "accepted",
        createdAt: new Date(),
      });

      return NextResponse.json({
        isFollowing: true,
      });
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    return NextResponse.json(
      { error: "Failed to toggle follow." },
      { status: 500 }
    );
  }
}
