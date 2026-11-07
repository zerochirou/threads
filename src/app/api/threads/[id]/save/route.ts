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
        { error: "Sign in to save posts." },
        { status: 401 }
      );
    }

    const { id: threadId } = await context.params;
    const db = await getDb();

    const existingThread = await db.query.threads.findFirst({
      where: eq(schema.threads.id, threadId),
    });

    if (!existingThread) {
      return NextResponse.json({ error: "Thread not found." }, { status: 404 });
    }

    const existingBookmark = await db.query.threadBookmarks.findFirst({
      where: and(
        eq(schema.threadBookmarks.userId, session.user.id),
        eq(schema.threadBookmarks.threadId, threadId)
      ),
    });

    if (existingBookmark) {
      await db
        .delete(schema.threadBookmarks)
        .where(eq(schema.threadBookmarks.id, existingBookmark.id));

      return NextResponse.json({
        saved: false,
      });
    } else {
      await db.insert(schema.threadBookmarks).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        threadId,
        createdAt: new Date(),
      });

      return NextResponse.json({
        saved: true,
      });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return NextResponse.json(
      { error: "Failed to toggle bookmark." },
      { status: 500 }
    );
  }
}
