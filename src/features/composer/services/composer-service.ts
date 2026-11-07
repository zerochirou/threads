"use client";

import { useSWRConfig } from "swr";
import {
  validateReplyContent,
  validateThreadEntries,
} from "../../../lib/security.ts";
import { isThreadsCacheKey } from "../../content-scrollbar/services/threads-service.ts";
import type {
  ThreadPostItem,
  ThreadReplyItem,
} from "../../content-scrollbar/types.ts";

export type PublishThreadResult =
  | { ok: true; post: ThreadPostItem }
  | { ok: false; error: string };

export type PublishReplyResult =
  | { ok: true; reply: ThreadReplyItem }
  | { ok: false; error: string };

export async function publishThreadRequest(
  rawEntries: string[],
  fetchImpl: typeof fetch = fetch
): Promise<PublishThreadResult> {
  const validation = validateThreadEntries(rawEntries);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  try {
    const response = await fetchImpl("/api/threads", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threads: validation.entries }),
    });

    const data = (await response.json()) as {
      post?: ThreadPostItem;
      error?: string;
    };

    if (!response.ok || !data.post) {
      return {
        ok: false,
        error:
          data.error ||
          "Could not publish thread. Make sure you are signed in.",
      };
    }

    return { ok: true, post: data.post };
  } catch {
    return { ok: false, error: "Network error while publishing thread." };
  }
}

export async function publishReplyRequest(
  params: { parentThreadId: string; content: string },
  fetchImpl: typeof fetch = fetch
): Promise<PublishReplyResult> {
  const validation = validateReplyContent(params.content);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  try {
    const response = await fetchImpl("/api/threads", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentThreadId: params.parentThreadId,
        content: validation.content,
      }),
    });

    const data = (await response.json()) as {
      reply?: ThreadReplyItem;
      error?: string;
    };

    if (!response.ok || !data.reply) {
      return {
        ok: false,
        error:
          data.error || "Failed to post reply. Make sure you are signed in.",
      };
    }

    return { ok: true, reply: data.reply };
  } catch {
    return { ok: false, error: "Network error while posting reply." };
  }
}

export function useComposerMutations() {
  const { mutate } = useSWRConfig();

  const createThread = async (rawEntries: string[]): Promise<PublishThreadResult> => {
    const result = await publishThreadRequest(rawEntries);
    if (result.ok) {
      await mutate((key) => isThreadsCacheKey(key));
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("threads:post-created", { detail: result.post })
        );
      }
    }
    return result;
  };

  const createReply = async (params: {
    parentThreadId: string;
    content: string;
  }): Promise<PublishReplyResult> => {
    const result = await publishReplyRequest(params);
    if (result.ok) {
      await mutate((key) => isThreadsCacheKey(key));
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("threads:reply-created", {
            detail: { postId: params.parentThreadId, reply: result.reply },
          })
        );
      }
    }
    return result;
  };

  return {
    createThread,
    createReply,
  };
}
