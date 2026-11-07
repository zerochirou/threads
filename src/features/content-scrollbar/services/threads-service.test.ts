import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  threadsKeys,
  isThreadsCacheKey,
  applyOptimisticLikeToPosts,
  applyOptimisticLikeToDetail,
  applyOptimisticSaveToPosts,
  prependCreatedPostToFeed,
  appendReplyToDetail,
  toggleThreadLikeRequest,
  toggleThreadSaveRequest,
} from "./threads-service.ts";
import type { ThreadPostItem, ThreadReplyItem } from "../types.ts";

const samplePost: ThreadPostItem = {
  id: "post-101",
  author: {
    id: "u-1",
    username: "zerochirou",
    fallback: "ZC",
  },
  timeAgo: "2m",
  content: "Refactoring with SWR",
  likeCount: 5,
  commentCount: 1,
  isLiked: false,
  isSaved: false,
  replies: [
    {
      id: "reply-201",
      parentThreadId: "post-101",
      author: { id: "u-2", username: "alice", fallback: "AL" },
      timeAgo: "1m",
      content: "Nice!",
      likeCount: 2,
      isLiked: false,
    },
  ],
};

describe("Content Scrollbar Services & Cache Helpers Seam", () => {
  it("generates deterministic SWR cache keys for feed, liked, saved, author, and detail", () => {
    assert.equal(threadsKeys.feed(), "/api/threads");
    assert.equal(threadsKeys.liked("u-1"), "/api/threads?liked=true&uid=u-1");
    assert.equal(threadsKeys.liked(null), null);
    assert.equal(threadsKeys.saved("u-1"), "/api/threads?saved=true&uid=u-1");
    assert.equal(threadsKeys.saved(undefined), null);
    assert.equal(
      threadsKeys.byAuthor({ authorId: "u-1" }),
      "/api/threads?authorId=u-1"
    );
    assert.equal(
      threadsKeys.byAuthor({ username: "zerochirou" }),
      "/api/threads?username=zerochirou"
    );
    assert.equal(
      threadsKeys.detail("post-101", "top"),
      "/api/threads/post-101?sort=top"
    );
    assert.equal(
      threadsKeys.detail("post-101", "recent"),
      "/api/threads/post-101?sort=recent"
    );
  });

  it("matches all /api/threads cache keys for cross-view invalidation", () => {
    assert.equal(isThreadsCacheKey("/api/threads"), true);
    assert.equal(isThreadsCacheKey("/api/threads?liked=true&uid=u-1"), true);
    assert.equal(isThreadsCacheKey("/api/threads/post-101?sort=top"), true);
    assert.equal(isThreadsCacheKey("/api/users/suggestions"), false);
  });

  it("applies optimistic like toggle and server reconciliation on post lists", () => {
    const toggled = applyOptimisticLikeToPosts([samplePost], "post-101");
    assert.equal(toggled[0].isLiked, true);
    assert.equal(toggled[0].likeCount, 6);

    const reconciled = applyOptimisticLikeToPosts([samplePost], "post-101", {
      liked: false,
      likeCount: 4,
    });
    assert.equal(reconciled[0].isLiked, false);
    assert.equal(reconciled[0].likeCount, 4);
  });

  it("applies optimistic like toggle to thread detail main post or reply", () => {
    const likedMain = applyOptimisticLikeToDetail(samplePost, "post-101");
    assert.equal(likedMain?.isLiked, true);
    assert.equal(likedMain?.likeCount, 6);

    const likedReply = applyOptimisticLikeToDetail(samplePost, "reply-201");
    assert.equal(likedReply?.replies?.[0].isLiked, true);
    assert.equal(likedReply?.replies?.[0].likeCount, 3);
  });

  it("applies optimistic save state and removes unsaved items when removeWhenUnsaved is true", () => {
    const savedList = applyOptimisticSaveToPosts([samplePost], "post-101", true, false);
    assert.equal(savedList[0].isSaved, true);

    const removedOnUnsave = applyOptimisticSaveToPosts(
      savedList,
      "post-101",
      false,
      true
    );
    assert.equal(removedOnUnsave.length, 0);
  });

  it("prepends newly created post without duplicating existing IDs", () => {
    const newPost: ThreadPostItem = {
      ...samplePost,
      id: "post-102",
      content: "Brand new post",
    };
    const updated = prependCreatedPostToFeed([samplePost], newPost);
    assert.equal(updated.length, 2);
    assert.equal(updated[0].id, "post-102");

    const duplicateAttempt = prependCreatedPostToFeed(updated, newPost);
    assert.equal(duplicateAttempt.length, 2);
  });

  it("appends a newly created reply to thread detail and increments commentCount", () => {
    const newReply: ThreadReplyItem = {
      id: "reply-202",
      parentThreadId: "post-101",
      author: { id: "u-3", username: "bob", fallback: "BO" },
      timeAgo: "now",
      content: "Second reply",
      likeCount: 0,
    };
    const updated = appendReplyToDetail(samplePost, newReply);
    assert.equal(updated?.commentCount, 2);
    assert.equal(updated?.replies?.[0].id, "reply-202");
  });

  it("executes like and save mutation requests against provided fetch implementation", async () => {
    const fakeFetch: typeof fetch = async (input) => {
      const url = String(input);
      if (url.endsWith("/like")) {
        return new Response(JSON.stringify({ liked: true, likeCount: 10 }), {
          status: 200,
        });
      }
      return new Response(JSON.stringify({ saved: true }), { status: 200 });
    };

    const likeResult = await toggleThreadLikeRequest("post-101", fakeFetch);
    assert.deepEqual(likeResult, { liked: true, likeCount: 10 });

    const saveResult = await toggleThreadSaveRequest("post-101", fakeFetch);
    assert.deepEqual(saveResult, { saved: true });
  });
});
