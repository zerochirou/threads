import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getAuth } from "@/lib/auth";
import {
  canViewPrivateProfileContent,
  isSameOriginMutation,
  validateReplyContent,
  validateThreadEntries,
} from "@/lib/security";
import type {
  ThreadLinkPreview,
  ThreadPostItem,
  ThreadReplyItem,
} from "@/features/content-scrollbar/types";

export function formatTimeAgo(dateInput: Date | number | string): string {
  const date =
    dateInput instanceof Date
      ? dateInput
      : typeof dateInput === "number"
        ? new Date(dateInput)
        : new Date(dateInput);
  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (diffSeconds < 60) return "now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w`;
}

export function buildAuthorInfo(author: {
  id: string;
  name: string;
  username: string | null;
  email: string;
  image: string | null;
  verified: boolean;
  hasFollowBadge: boolean;
}) {
  const username =
    author.username ||
    author.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_.]/g, "") ||
    "user";
  const displayName = author.name || username;
  return {
    id: author.id,
    name: displayName,
    username,
    avatarUrl:
      author.image ||
      `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(username)}`,
    fallback: displayName.slice(0, 2).toUpperCase(),
    verified: Boolean(author.verified),
    hasFollowBadge: Boolean(author.hasFollowBadge),
    badgeIcons:
      username === "miqdadbadjuber" ? ["author", "liked_by_author"] : undefined,
  };
}

export async function ensureDemoThreadsSeeded(
  db?: Awaited<ReturnType<typeof getDb>>
) {
  void db;
  return;
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    await ensureDemoThreadsSeeded();

    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const currentUserId = session?.user?.id ?? null;

    const { searchParams } = new URL(request.url);
    const authorIdParam = searchParams.get("authorId");
    const usernameParam = searchParams.get("username");
    const likedParam = searchParams.get("liked") === "true";
    const savedParam = searchParams.get("saved") === "true";

    if (likedParam) {
      if (!currentUserId) {
        return NextResponse.json({ posts: [], userReplies: [], requiresAuth: true });
      }

      const likedThreads = await db
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
          likedAt: schema.threadLikes.createdAt,
        })
        .from(schema.threadLikes)
        .innerJoin(schema.threads, eq(schema.threadLikes.threadId, schema.threads.id))
        .innerJoin(schema.user, eq(schema.threads.authorId, schema.user.id))
        .where(
          and(
            eq(schema.threadLikes.userId, currentUserId),
            eq(schema.threads.isDraft, false)
          )
        )
        .orderBy(desc(schema.threadLikes.createdAt))
        .limit(50);

      if (likedThreads.length === 0) {
        return NextResponse.json({ posts: [], userReplies: [] });
      }

      const likedThreadIdsList = likedThreads.map((item) => item.thread.id);
      const linkPreviewByThread = new Map<string, ThreadLinkPreview>();
      const previewRows = await db
        .select()
        .from(schema.threadLinkPreviews)
        .where(inArray(schema.threadLinkPreviews.threadId, likedThreadIdsList));

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

      const savedThreadIds = new Set<string>();
      const userBookmarks = await db
        .select({ threadId: schema.threadBookmarks.threadId })
        .from(schema.threadBookmarks)
        .where(
          and(
            eq(schema.threadBookmarks.userId, currentUserId),
            inArray(schema.threadBookmarks.threadId, likedThreadIdsList)
          )
        );
      for (const b of userBookmarks) {
        savedThreadIds.add(b.threadId);
      }

      const likedPosts: ThreadPostItem[] = likedThreads.map(({ thread, author }) => ({
        id: thread.id,
        author: buildAuthorInfo(author),
        timeAgo: formatTimeAgo(thread.createdAt),
        content: thread.content,
        likeCount: thread.likeCount,
        commentCount: thread.replyCount,
        repostCount: thread.repostCount,
        shareCount: thread.shareCount,
        isLiked: true,
        isSaved: savedThreadIds.has(thread.id),
        linkPreview: linkPreviewByThread.get(thread.id),
      }));

      return NextResponse.json({ posts: likedPosts, userReplies: [] });
    }

    if (savedParam) {
      if (!currentUserId) {
        return NextResponse.json({ posts: [], userReplies: [], requiresAuth: true });
      }

      const savedThreads = await db
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
          savedAt: schema.threadBookmarks.createdAt,
        })
        .from(schema.threadBookmarks)
        .innerJoin(schema.threads, eq(schema.threadBookmarks.threadId, schema.threads.id))
        .innerJoin(schema.user, eq(schema.threads.authorId, schema.user.id))
        .where(
          and(
            eq(schema.threadBookmarks.userId, currentUserId),
            eq(schema.threads.isDraft, false)
          )
        )
        .orderBy(desc(schema.threadBookmarks.createdAt))
        .limit(50);

      if (savedThreads.length === 0) {
        return NextResponse.json({ posts: [], userReplies: [] });
      }

      const savedThreadIdsList = savedThreads.map((item) => item.thread.id);
      const linkPreviewByThread = new Map<string, ThreadLinkPreview>();
      const previewRows = await db
        .select()
        .from(schema.threadLinkPreviews)
        .where(inArray(schema.threadLinkPreviews.threadId, savedThreadIdsList));

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

      const likedThreadIds = new Set<string>();
      const userLikes = await db
        .select({ threadId: schema.threadLikes.threadId })
        .from(schema.threadLikes)
        .where(
          and(
            eq(schema.threadLikes.userId, currentUserId),
            inArray(schema.threadLikes.threadId, savedThreadIdsList)
          )
        );
      for (const l of userLikes) {
        likedThreadIds.add(l.threadId);
      }

      const savedPosts: ThreadPostItem[] = savedThreads.map(({ thread, author }) => ({
        id: thread.id,
        author: buildAuthorInfo(author),
        timeAgo: formatTimeAgo(thread.createdAt),
        content: thread.content,
        likeCount: thread.likeCount,
        commentCount: thread.replyCount,
        repostCount: thread.repostCount,
        shareCount: thread.shareCount,
        isLiked: likedThreadIds.has(thread.id),
        isSaved: true,
        linkPreview: linkPreviewByThread.get(thread.id),
      }));

      return NextResponse.json({ posts: savedPosts, userReplies: [] });
    }

    let targetAuthorId: string | null = authorIdParam;
    let targetUserRecord: typeof schema.user.$inferSelect | undefined;
    if (targetAuthorId) {
      targetUserRecord = await db.query.user.findFirst({
        where: eq(schema.user.id, targetAuthorId),
      });
    } else if (usernameParam) {
      targetUserRecord = await db.query.user.findFirst({
        where: eq(schema.user.username, usernameParam.toLowerCase()),
      });
      targetAuthorId = targetUserRecord?.id ?? "__not_found__";
    }

    if (targetUserRecord && Boolean(targetUserRecord.isPrivate)) {
      const isSelf = currentUserId === targetUserRecord.id;
      let isFollowing = false;
      if (currentUserId && !isSelf) {
        const followRecord = await db.query.follows.findFirst({
          where: and(
            eq(schema.follows.followerId, currentUserId),
            eq(schema.follows.followingId, targetUserRecord.id),
            eq(schema.follows.status, "accepted")
          ),
        });
        isFollowing = Boolean(followRecord);
      }

      if (
        !canViewPrivateProfileContent({
          isPrivate: true,
          isSelf,
          isFollowing,
        })
      ) {
        return NextResponse.json({
          posts: [],
          userReplies: [],
          isPrivateLocked: true,
        });
      }
    }

    const rootThreads = await db
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
      .where(
        targetAuthorId
          ? and(
              isNull(schema.threads.parentThreadId),
              eq(schema.threads.isDraft, false),
              eq(schema.threads.authorId, targetAuthorId)
            )
          : and(
              isNull(schema.threads.parentThreadId),
              eq(schema.threads.isDraft, false)
            )
      )
      .orderBy(desc(schema.threads.createdAt))
      .limit(50);

    if (rootThreads.length === 0) {
      return NextResponse.json({ posts: [], userReplies: [] });
    }

    const rootIds = rootThreads.map((r) => r.thread.id);

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
      .where(inArray(schema.threads.parentThreadId, rootIds))
      .orderBy(schema.threads.createdAt);

    const allThreadIds = [
      ...rootIds,
      ...replyRows.map((r) => r.thread.id),
    ];

    const linkPreviewByThread = new Map<string, ThreadLinkPreview>();
    if (allThreadIds.length > 0) {
      const previewRows = await db
        .select()
        .from(schema.threadLinkPreviews)
        .where(inArray(schema.threadLinkPreviews.threadId, allThreadIds));
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
    const savedThreadIds = new Set<string>();
    if (currentUserId && allThreadIds.length > 0) {
      const userLikes = await db
        .select({ threadId: schema.threadLikes.threadId })
        .from(schema.threadLikes)
        .where(
          and(
            eq(schema.threadLikes.userId, currentUserId),
            inArray(schema.threadLikes.threadId, allThreadIds)
          )
        );
      for (const l of userLikes) {
        likedThreadIds.add(l.threadId);
      }

      const userBookmarks = await db
        .select({ threadId: schema.threadBookmarks.threadId })
        .from(schema.threadBookmarks)
        .where(
          and(
            eq(schema.threadBookmarks.userId, currentUserId),
            inArray(schema.threadBookmarks.threadId, allThreadIds)
          )
        );
      for (const b of userBookmarks) {
        savedThreadIds.add(b.threadId);
      }
    }

    const repliesByParent = new Map<string, ThreadReplyItem[]>();
    for (const r of replyRows) {
      const parentId = r.thread.parentThreadId;
      if (!parentId) continue;
      const list = repliesByParent.get(parentId) || [];
      list.push({
        id: r.thread.id,
        parentThreadId: parentId,
        author: buildAuthorInfo(r.author),
        timeAgo: formatTimeAgo(r.thread.createdAt),
        content: r.thread.content,
        likeCount: r.thread.likeCount,
        commentCount: r.thread.replyCount,
        repostCount: r.thread.repostCount,
        shareCount: r.thread.shareCount,
        isLiked: likedThreadIds.has(r.thread.id),
        isSaved: savedThreadIds.has(r.thread.id),
        linkPreview: linkPreviewByThread.get(r.thread.id),
        createdAt: r.thread.createdAt.toISOString(),
      });
      repliesByParent.set(parentId, list);
    }

    const posts: ThreadPostItem[] = rootThreads.map(({ thread, author }) => {
      const replies = repliesByParent.get(thread.id) || [];
      return {
        id: thread.id,
        author: buildAuthorInfo(author),
        timeAgo: formatTimeAgo(thread.createdAt),
        content: thread.content,
        likeCount: thread.likeCount,
        commentCount: Math.max(thread.replyCount, replies.length),
        repostCount: thread.repostCount,
        shareCount: thread.shareCount,
        viewsCount: thread.id === "post-1" ? "6K views" : undefined,
        isLiked: likedThreadIds.has(thread.id),
        isSaved: savedThreadIds.has(thread.id),
        linkPreview: linkPreviewByThread.get(thread.id),
        replies,
      };
    });

    // If querying for a specific profile author, also fetch replies authored by that user
    let userReplies: ThreadPostItem[] = [];
    if (targetAuthorId && targetAuthorId !== "__not_found__") {
      const authoredReplyRows = await db
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
        .where(
          and(
            eq(schema.threads.authorId, targetAuthorId),
            sql`${schema.threads.parentThreadId} IS NOT NULL`
          )
        )
        .orderBy(desc(schema.threads.createdAt))
        .limit(30);

      userReplies = authoredReplyRows.map(({ thread, author }) => ({
        id: thread.id,
        author: buildAuthorInfo(author),
        timeAgo: formatTimeAgo(thread.createdAt),
        content: thread.content,
        likeCount: thread.likeCount,
        commentCount: thread.replyCount,
        repostCount: thread.repostCount,
        shareCount: thread.shareCount,
        parentThreadId: thread.parentThreadId,
      }));
    }

    return NextResponse.json({ posts, userReplies });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Failed to load threads." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
        { error: "You must be signed in to post or comment." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      content?: string;
      threads?: string[];
      parentThreadId?: string;
    };

    const db = await getDb();
    await ensureDemoThreadsSeeded(db);
    const now = new Date();

    if (body.parentThreadId) {
      const replyValidation = validateReplyContent(body.content);
      if (!replyValidation.valid) {
        return NextResponse.json(
          { error: replyValidation.error },
          { status: 400 }
        );
      }
      const content = replyValidation.content;

      const parentThread = await db.query.threads.findFirst({
        where: eq(schema.threads.id, body.parentThreadId),
      });

      if (!parentThread) {
        return NextResponse.json(
          { error: "Parent thread not found." },
          { status: 404 }
        );
      }

      const replyId = crypto.randomUUID();
      const rootThreadId = parentThread.rootThreadId || parentThread.id;

      await db.insert(schema.threads).values({
        id: replyId,
        authorId: session.user.id,
        content,
        parentThreadId: parentThread.id,
        rootThreadId,
        threadOrder: 0,
        createdAt: now,
        updatedAt: now,
      });

      await db
        .update(schema.threads)
        .set({
          replyCount: sql`${schema.threads.replyCount} + 1`,
          updatedAt: now,
        })
        .where(eq(schema.threads.id, parentThread.id));

      const reply: ThreadReplyItem = {
        id: replyId,
        parentThreadId: parentThread.id,
        author: buildAuthorInfo({
          id: session.user.id,
          name: session.user.name,
          username: session.user.username ?? null,
          email: session.user.email,
          image: session.user.image ?? null,
          verified: Boolean(session.user.verified),
          hasFollowBadge: Boolean(session.user.hasFollowBadge),
        }),
        timeAgo: "now",
        content,
        likeCount: 0,
        createdAt: now.toISOString(),
      };

      return NextResponse.json({ reply }, { status: 201 });
    }

    const threadValidation = validateThreadEntries(
      Array.isArray(body.threads) ? body.threads : body.content
    );
    if (!threadValidation.valid) {
      return NextResponse.json(
        { error: threadValidation.error },
        { status: 400 }
      );
    }
    const entries = threadValidation.entries;

    const rootId = crypto.randomUUID();
    const authorInfo = buildAuthorInfo({
      id: session.user.id,
      name: session.user.name,
      username: session.user.username ?? null,
      email: session.user.email,
      image: session.user.image ?? null,
      verified: Boolean(session.user.verified),
      hasFollowBadge: Boolean(session.user.hasFollowBadge),
    });

    await db.insert(schema.threads).values({
      id: rootId,
      authorId: session.user.id,
      content: entries[0],
      parentThreadId: null,
      rootThreadId: null,
      threadOrder: 0,
      replyCount: entries.length > 1 ? entries.length - 1 : 0,
      createdAt: now,
      updatedAt: now,
    });

    const createdReplies: ThreadReplyItem[] = [];

    for (let i = 1; i < entries.length; i++) {
      const childId = crypto.randomUUID();
      const childTime = new Date(now.getTime() + i);
      await db.insert(schema.threads).values({
        id: childId,
        authorId: session.user.id,
        content: entries[i],
        parentThreadId: rootId,
        rootThreadId: rootId,
        threadOrder: i,
        createdAt: childTime,
        updatedAt: childTime,
      });

      createdReplies.push({
        id: childId,
        parentThreadId: rootId,
        author: authorInfo,
        timeAgo: "now",
        content: entries[i],
        likeCount: 0,
        createdAt: childTime.toISOString(),
      });
    }

    const post: ThreadPostItem = {
      id: rootId,
      author: authorInfo,
      timeAgo: "now",
      content: entries[0],
      likeCount: 0,
      commentCount: createdReplies.length,
      repostCount: 0,
      shareCount: 0,
      isLiked: false,
      replies: createdReplies,
    };

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: "Failed to publish thread." },
      { status: 500 }
    );
  }
}
