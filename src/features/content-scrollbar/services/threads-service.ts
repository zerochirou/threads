"use client";

import useSWR, { preload, useSWRConfig } from "swr";
import { swrFetcher } from "../../../lib/fetcher.ts";
import type { ThreadPostItem, ThreadReplyItem } from "../types.ts";

export interface ThreadsListResponse {
  posts: ThreadPostItem[];
  userReplies?: ThreadPostItem[];
  requiresAuth?: boolean;
  isPrivateLocked?: boolean;
}

export interface ThreadDetailResponse {
  post: ThreadPostItem;
}

export interface ToggleLikeResponse {
  liked?: boolean;
  likeCount?: number;
}

export interface ToggleSaveResponse {
  saved?: boolean;
}

export const threadsKeys = {
  feed: () => "/api/threads" as const,
  liked: (userId?: string | null) =>
    userId ? `/api/threads?liked=true&uid=${encodeURIComponent(userId)}` : null,
  saved: (userId?: string | null) =>
    userId ? `/api/threads?saved=true&uid=${encodeURIComponent(userId)}` : null,
  byAuthor: (params: { authorId?: string | null; username?: string | null }) => {
    if (params.authorId) {
      return `/api/threads?authorId=${encodeURIComponent(params.authorId)}`;
    }
    if (params.username) {
      return `/api/threads?username=${encodeURIComponent(params.username)}`;
    }
    return null;
  },
  detail: (threadId?: string | null, sort: "top" | "recent" = "top") =>
    threadId
      ? `/api/threads/${encodeURIComponent(threadId)}?sort=${sort}`
      : null,
};

export function isThreadsCacheKey(key: unknown): key is string {
  return typeof key === "string" && key.startsWith("/api/threads");
}

export function applyOptimisticLikeToPosts(
  posts: ThreadPostItem[],
  postId: string,
  serverState?: ToggleLikeResponse
): ThreadPostItem[] {
  return posts.map((post) => {
    if (post.id !== postId) return post;
    if (
      serverState &&
      typeof serverState.liked === "boolean" &&
      typeof serverState.likeCount === "number"
    ) {
      return {
        ...post,
        isLiked: serverState.liked,
        likeCount: serverState.likeCount,
      };
    }
    const nextLiked = !post.isLiked;
    return {
      ...post,
      isLiked: nextLiked,
      likeCount: Math.max(0, post.likeCount + (nextLiked ? 1 : -1)),
    };
  });
}

export function applyOptimisticLikeToDetail(
  post: ThreadPostItem | null | undefined,
  targetId: string,
  serverState?: ToggleLikeResponse
): ThreadPostItem | null {
  if (!post) return null;

  if (post.id === targetId) {
    if (
      serverState &&
      typeof serverState.liked === "boolean" &&
      typeof serverState.likeCount === "number"
    ) {
      return {
        ...post,
        isLiked: serverState.liked,
        likeCount: serverState.likeCount,
      };
    }
    const nextLiked = !post.isLiked;
    return {
      ...post,
      isLiked: nextLiked,
      likeCount: Math.max(0, post.likeCount + (nextLiked ? 1 : -1)),
    };
  }

  if (!post.replies) return post;

  return {
    ...post,
    replies: post.replies.map((reply) => {
      if (reply.id !== targetId) return reply;
      if (
        serverState &&
        typeof serverState.liked === "boolean" &&
        typeof serverState.likeCount === "number"
      ) {
        return {
          ...reply,
          isLiked: serverState.liked,
          likeCount: serverState.likeCount,
        };
      }
      const nextLiked = !reply.isLiked;
      return {
        ...reply,
        isLiked: nextLiked,
        likeCount: Math.max(0, reply.likeCount + (nextLiked ? 1 : -1)),
      };
    }),
  };
}

export function applyOptimisticSaveToPosts(
  posts: ThreadPostItem[],
  postId: string,
  saved: boolean,
  removeWhenUnsaved = false
): ThreadPostItem[] {
  if (!saved && removeWhenUnsaved) {
    return posts.filter((post) => post.id !== postId);
  }
  return posts.map((post) =>
    post.id === postId ? { ...post, isSaved: saved } : post
  );
}

export function prependCreatedPostToFeed(
  posts: ThreadPostItem[],
  newPost: ThreadPostItem
): ThreadPostItem[] {
  if (posts.some((post) => post.id === newPost.id)) {
    return posts;
  }
  return [newPost, ...posts];
}

export function appendReplyToDetail(
  post: ThreadPostItem | null | undefined,
  createdReply: ThreadReplyItem
): ThreadPostItem | null {
  if (!post) return null;
  const existingReplies = post.replies ?? [];
  if (existingReplies.some((reply) => reply.id === createdReply.id)) {
    return post;
  }
  return {
    ...post,
    commentCount: (post.commentCount ?? existingReplies.length) + 1,
    replies: [createdReply, ...existingReplies],
  };
}

export async function toggleThreadLikeRequest(
  postId: string,
  fetchImpl: typeof fetch = fetch
): Promise<ToggleLikeResponse | null> {
  const response = await fetchImpl(`/api/threads/${encodeURIComponent(postId)}/like`, {
    method: "POST",
    credentials: "same-origin",
  });
  if (!response.ok) return null;
  return (await response.json()) as ToggleLikeResponse;
}

export async function toggleThreadSaveRequest(
  postId: string,
  fetchImpl: typeof fetch = fetch
): Promise<ToggleSaveResponse | null> {
  const response = await fetchImpl(`/api/threads/${encodeURIComponent(postId)}/save`, {
    method: "POST",
    credentials: "same-origin",
  });
  if (!response.ok) return null;
  return (await response.json()) as ToggleSaveResponse;
}

export async function deleteThreadRequest(
  postId: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetchImpl(`/api/threads/${encodeURIComponent(postId)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const data = (await response.json()) as { success?: boolean; error?: string };
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || "Failed to delete thread." };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Network error while deleting thread." };
  }
}

export function prefetchThreadDetail(
  threadId: string,
  sort: "top" | "recent" = "top"
) {
  const key = threadsKeys.detail(threadId, sort);
  if (key) {
    void preload(key, (url: string) => swrFetcher<ThreadDetailResponse>(url));
  }
}

export function useThreadsFeed(initialPosts?: ThreadPostItem[]) {
  const { mutate: globalMutate } = useSWRConfig();
  const key = threadsKeys.feed();

  const fallbackData: ThreadsListResponse | undefined = initialPosts
    ? { posts: initialPosts }
    : undefined;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<ThreadsListResponse>(key, (url: string) => swrFetcher<ThreadsListResponse>(url), {
      fallbackData,
    });

  const posts = data?.posts ?? initialPosts ?? [];

  const toggleLike = async (postId: string) => {
    await mutate(
      (current) => ({
        ...current,
        posts: applyOptimisticLikeToPosts(current?.posts ?? posts, postId),
      }),
      { revalidate: false }
    );

    try {
      const result = await toggleThreadLikeRequest(postId);
      if (result) {
        await mutate(
          (current) => ({
            ...current,
            posts: applyOptimisticLikeToPosts(
              current?.posts ?? posts,
              postId,
              result
            ),
          }),
          { revalidate: false }
        );
        await globalMutate(
          (cacheKey) =>
            typeof cacheKey === "string" &&
            cacheKey.startsWith("/api/threads?liked=true")
        );
      }
    } catch {
      await mutate();
    }
  };

  const toggleSave = async (postId: string, nextSaved: boolean) => {
    await mutate(
      (current) => ({
        ...current,
        posts: applyOptimisticSaveToPosts(
          current?.posts ?? posts,
          postId,
          nextSaved,
          false
        ),
      }),
      { revalidate: false }
    );
    await globalMutate(
      (cacheKey) =>
        typeof cacheKey === "string" &&
        cacheKey.startsWith("/api/threads?saved=true")
    );
  };

  const prependPost = async (newPost: ThreadPostItem) => {
    await mutate(
      (current) => ({
        ...current,
        posts: prependCreatedPostToFeed(current?.posts ?? posts, newPost),
      }),
      { revalidate: false }
    );
  };

  const removePost = async (postId: string) => {
    await mutate(
      (current) => ({
        ...current,
        posts: (current?.posts ?? posts).filter((p) => p.id !== postId),
      }),
      { revalidate: false }
    );
  };

  return {
    posts,
    isLoading,
    isValidating,
    error,
    mutate,
    toggleLike,
    toggleSave,
    prependPost,
    removePost,
  };
}

export function useLikedThreads(
  userId?: string | null,
  initialPosts: ThreadPostItem[] = []
) {
  const { mutate: globalMutate } = useSWRConfig();
  const key = threadsKeys.liked(userId);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<ThreadsListResponse>(
      key,
      (url: string) => swrFetcher<ThreadsListResponse>(url),
      {
        fallbackData: initialPosts.length > 0 ? { posts: initialPosts } : undefined,
      }
    );

  const posts = key ? (data?.posts ?? initialPosts) : [];

  const toggleLike = async (postId: string) => {
    await mutate(
      (current) => ({
        ...current,
        posts: applyOptimisticLikeToPosts(current?.posts ?? posts, postId),
      }),
      { revalidate: false }
    );

    try {
      const result = await toggleThreadLikeRequest(postId);
      if (result) {
        await mutate(
          (current) => ({
            ...current,
            posts: applyOptimisticLikeToPosts(
              current?.posts ?? posts,
              postId,
              result
            ),
          }),
          { revalidate: false }
        );
        await globalMutate(threadsKeys.feed());
      }
    } catch {
      await mutate();
    }
  };

  return {
    posts,
    isLoading: Boolean(key) && isLoading,
    isValidating,
    error,
    mutate,
    toggleLike,
  };
}

export function useSavedThreads(
  userId?: string | null,
  initialPosts: ThreadPostItem[] = []
) {
  const { mutate: globalMutate } = useSWRConfig();
  const key = threadsKeys.saved(userId);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<ThreadsListResponse>(
      key,
      (url: string) => swrFetcher<ThreadsListResponse>(url),
      {
        fallbackData: initialPosts.length > 0 ? { posts: initialPosts } : undefined,
      }
    );

  const posts = key ? (data?.posts ?? initialPosts) : [];

  const toggleLike = async (postId: string) => {
    await mutate(
      (current) => ({
        ...current,
        posts: applyOptimisticLikeToPosts(current?.posts ?? posts, postId),
      }),
      { revalidate: false }
    );

    try {
      const result = await toggleThreadLikeRequest(postId);
      if (result) {
        await mutate(
          (current) => ({
            ...current,
            posts: applyOptimisticLikeToPosts(
              current?.posts ?? posts,
              postId,
              result
            ),
          }),
          { revalidate: false }
        );
        await globalMutate(threadsKeys.feed());
      }
    } catch {
      await mutate();
    }
  };

  const toggleSave = async (postId: string, saved: boolean) => {
    await mutate(
      (current) => ({
        ...current,
        posts: applyOptimisticSaveToPosts(
          current?.posts ?? posts,
          postId,
          saved,
          true
        ),
      }),
      { revalidate: false }
    );
    await globalMutate(threadsKeys.feed());
  };

  return {
    posts,
    isLoading: Boolean(key) && isLoading,
    isValidating,
    error,
    mutate,
    toggleLike,
    toggleSave,
  };
}

export function useThreadDetail(
  threadId: string,
  sortBy: "top" | "recent" = "top"
) {
  const { mutate: globalMutate } = useSWRConfig();
  const key = threadsKeys.detail(threadId, sortBy);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<ThreadDetailResponse>(key, (url: string) =>
      swrFetcher<ThreadDetailResponse>(url)
    );

  const post = data?.post ?? null;

  const toggleMainLike = async () => {
    if (!post) return;
    await mutate(
      (current) => {
        const updated = applyOptimisticLikeToDetail(current?.post ?? post, post.id);
        return updated ? { post: updated } : current;
      },
      { revalidate: false }
    );

    try {
      const result = await toggleThreadLikeRequest(post.id);
      if (result) {
        await mutate(
          (current) => {
            const updated = applyOptimisticLikeToDetail(
              current?.post ?? post,
              post.id,
              result
            );
            return updated ? { post: updated } : current;
          },
          { revalidate: false }
        );
        await globalMutate(threadsKeys.feed());
      }
    } catch {
      await mutate();
    }
  };

  const toggleReplyLike = async (replyId: string) => {
    if (!post) return;
    await mutate(
      (current) => {
        const updated = applyOptimisticLikeToDetail(current?.post ?? post, replyId);
        return updated ? { post: updated } : current;
      },
      { revalidate: false }
    );

    try {
      const result = await toggleThreadLikeRequest(replyId);
      if (result) {
        await mutate(
          (current) => {
            const updated = applyOptimisticLikeToDetail(
              current?.post ?? post,
              replyId,
              result
            );
            return updated ? { post: updated } : current;
          },
          { revalidate: false }
        );
      }
    } catch {
      await mutate();
    }
  };

  const appendReply = async (createdReply: ThreadReplyItem) => {
    await mutate(
      (current) => {
        const updated = appendReplyToDetail(current?.post ?? post, createdReply);
        return updated ? { post: updated } : current;
      },
      { revalidate: false }
    );
    await globalMutate(threadsKeys.feed());
  };

  const removeReply = async (replyId: string) => {
    await mutate(
      (current) => {
        if (!current?.post) return current;
        const currentReplies = current.post.replies ?? [];
        const nextReplies = currentReplies.filter((r) => r.id !== replyId);
        return {
          ...current,
          post: {
            ...current.post,
            commentCount: Math.max(0, (current.post.commentCount ?? currentReplies.length) - 1),
            replies: nextReplies,
          },
        };
      },
      { revalidate: false }
    );
    await globalMutate(threadsKeys.feed());
  };

  const loadError = error
    ? "Thread could not be found."
    : !isLoading && !post
      ? "Thread could not be found."
      : null;

  return {
    post,
    isLoading,
    isValidating,
    loadError,
    mutate,
    toggleMainLike,
    toggleReplyLike,
    appendReply,
    removeReply,
  };
}
