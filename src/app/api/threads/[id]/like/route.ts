import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getAuth } from "@/lib/auth";
import { isSameOriginMutation } from "@/lib/security";
import { ensureDemoThreadsSeeded } from "../../route";

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
        { error: "Sign in to like posts." },
        { status: 401 }
      );
    }

    const { id: threadId } = await context.params;
    const db = await getDb();
    await ensureDemoThreadsSeeded(db);

    const existingThread = await db.query.threads.findFirst({
      where: eq(schema.threads.id, threadId),
    });

    if (!existingThread) {
      return NextResponse.json({ error: "Thread not found." }, { status: 404 });
    }

    const existingLike = await db.query.threadLikes.findFirst({
      where: and(
        eq(schema.threadLikes.userId, session.user.id),
        eq(schema.threadLikes.threadId, threadId)
      ),
    });

    if (existingLike) {
      await db
        .delete(schema.threadLikes)
        .where(eq(schema.threadLikes.id, existingLike.id));

      await db
        .update(schema.threads)
        .set({
          likeCount: sql`MAX(0, ${schema.threads.likeCount} - 1)`,
        })
        .where(eq(schema.threads.id, threadId));

      return NextResponse.json({
        liked: false,
        likeCount: Math.max(0, existingThread.likeCount - 1),
      });
    } else {
      await db.insert(schema.threadLikes).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        threadId,
        createdAt: new Date(),
      });

      await db
        .update(schema.threads)
        .set({
          likeCount: sql`${schema.threads.likeCount} + 1`,
        })
        .where(eq(schema.threads.id, threadId));

      return NextResponse.json({
        liked: true,
        likeCount: existingThread.likeCount + 1,
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like." },
      { status: 500 }
    );
  }
}
