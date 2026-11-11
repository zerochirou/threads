import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getAuth } from "@/lib/auth";
import {
  buildAuthorInfo,
  ensureDemoThreadsSeeded,
  formatTimeAgo,
} from "../route";
import type {
  ThreadLinkPreview,
  ThreadPostItem,
  ThreadReplyItem,
} from "@/features/content-scrollbar/types";
import { DEFAULT_POSTS } from "@/features/content-scrollbar/constants/default-posts";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: threadId } = await context.params;

    const defaultMatch = DEFAULT_POSTS.find((p) => p.id === threadId);
    if (defaultMatch) {
      return NextResponse.json({
        post: {
          ...defaultMatch,
          viewsCount: defaultMatch.viewsCount ?? "6K views",
          replies: defaultMatch.replies ?? [],
        },
      });
    }

    const db = await getDb();
    await ensureDemoThreadsSeeded(db);

    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const currentUserId = session?.user?.id ?? null;

    const { searchParams } = new URL(request.url);
    const sortParam = searchParams.get("sort") === "recent" ? "recent" : "top";

    const mainRows = await db
      .select({
        thread: schema.threads,
        author: {
          id: schema.user.id,
          name: schema.user.name,
          username: schema.user.username,
          email: schema.user.email,
          image: schema.user.image,
          verified: schema.user.verified,
          hasFollowBadge: schema.user.hasFollowBadge,
        },
      })
      .from(schema.threads)
      .innerJoin(schema.user, eq(schema.threads.authorId, schema.user.id))
      .where(eq(schema.threads.id, threadId))
      .limit(1);

    if (mainRows.length === 0) {
      return NextResponse.json({ error: "Thread not found." }, { status: 404 });
    }

    const { thread: mainThread, author: mainAuthor } = mainRows[0];

    const replyRows = await db
      .select({
        thread: schema.threads,
        author: {
          id: schema.user.id,
          name: schema.user.name,
          username: schema.user.username,
          email: schema.user.email,
          image: schema.user.image,
          verified: schema.user.verified,
          hasFollowBadge: schema.user.hasFollowBadge,
        },
      })
      .from(schema.threads)
      .innerJoin(schema.user, eq(schema.threads.authorId, schema.user.id))
      .where(eq(schema.threads.parentThreadId, threadId))
      .orderBy(
        sortParam === "recent"
          ? desc(schema.threads.createdAt)
          : desc(schema.threads.likeCount),
        desc(schema.threads.createdAt),
      );

    const allIds = [threadId, ...replyRows.map((r) => r.thread.id)];

    const linkPreviewByThread = new Map<string, ThreadLinkPreview>();
    if (allIds.length > 0) {
      const previewRows = await db
        .select()
        .from(schema.threadLinkPreviews)
        .where(inArray(schema.threadLinkPreviews.threadId, allIds));

      for (const p of previewRows) {
        linkPreviewByThread.set(p.threadId, {
          url: p.url,
          domain: p.domain,
          title: p.title || p.domain,
          headline: p.headline ?? undefined,
          subheadline: p.subheadline ?? undefined,
          tagline: p.tagline ?? undefined,
        });
      }
    }

    const likedThreadIds = new Set<string>();
    if (currentUserId && allIds.length > 0) {
      const userLikes = await db
        .select({ threadId: schema.threadLikes.threadId })
        .from(schema.threadLikes)
        .where(
          and(
            eq(schema.threadLikes.userId, currentUserId),
            inArray(schema.threadLikes.threadId, allIds),
          ),
        );
      for (const l of userLikes) {
        likedThreadIds.add(l.threadId);
      }
    }

    const replies: ThreadReplyItem[] = replyRows.map(({ thread, author }) => ({
      id: thread.id,
      parentThreadId: threadId,
      author: buildAuthorInfo(author),
      timeAgo: formatTimeAgo(thread.createdAt),
      content: thread.content,
      likeCount: thread.likeCount,
      commentCount: thread.replyCount,
      repostCount: thread.repostCount,
      shareCount: thread.shareCount,
      isLiked: likedThreadIds.has(thread.id),
      linkPreview: linkPreviewByThread.get(thread.id),
      createdAt: thread.createdAt.toISOString(),
    }));

    const estimatedViews =
      threadId === "post-1"
        ? "6K views"
        : `${Math.max(12, (mainThread.likeCount + 1) * 18 + replies.length * 9)} views`;

    const post: ThreadPostItem = {
      id: mainThread.id,
      author: buildAuthorInfo(mainAuthor),
      timeAgo: formatTimeAgo(mainThread.createdAt),
      content: mainThread.content,
      likeCount: mainThread.likeCount,
      commentCount: Math.max(mainThread.replyCount, replies.length),
      repostCount: mainThread.repostCount,
      shareCount: mainThread.shareCount,
      viewsCount: estimatedViews,
      isLiked: likedThreadIds.has(mainThread.id),
      linkPreview: linkPreviewByThread.get(mainThread.id),
      parentThreadId: mainThread.parentThreadId,
      replies,
    };

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching single thread:", error);
    return NextResponse.json(
      { error: "Failed to load thread details." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: threadId } = await context.params;
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to delete a thread." },
        { status: 401 },
      );
    }

    const db = await getDb();
    const existing = await db.query.threads.findFirst({
      where: eq(schema.threads.id, threadId),
    });

    if (!existing) {
      return NextResponse.json({ error: "Thread not found." }, { status: 404 });
    }

    if (existing.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this thread." },
        { status: 403 },
      );
    }

    await db.delete(schema.threads).where(eq(schema.threads.id, threadId));

    if (existing.parentThreadId) {
      await db
        .update(schema.threads)
        .set({
          replyCount: sql`max(0, ${schema.threads.replyCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(schema.threads.id, existing.parentThreadId));
    }

    return NextResponse.json({
      success: true,
      deletedId: threadId,
      parentThreadId: existing.parentThreadId ?? null,
    });
  } catch (error) {
    console.error("Error deleting thread:", error);
    return NextResponse.json(
      { error: "Failed to delete thread." },
      { status: 500 },
    );
  }
}
