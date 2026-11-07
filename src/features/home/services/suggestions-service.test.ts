import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  suggestionsKeys,
  isUserFollowCacheKey,
  applyOptimisticFollowToSuggestions,
  filterFollowSuggestions,
  toggleUserFollowRequest,
} from "./suggestions-service.ts";
import type { FollowSuggestion } from "../types.ts";

const sampleSuggestions: FollowSuggestion[] = [
  {
    id: "u-10",
    username: "alice_dev",
    displayName: "Alice Dev",
    avatarUrl: "https://example.com/alice.png",
    fallback: "AD",
    bio: "Building TypeScript systems",
    followersCount: "120 followers",
    isFollowing: false,
  },
  {
    id: "u-11",
    username: "bob_design",
    displayName: "Bob Designer",
    avatarUrl: "https://example.com/bob.png",
    fallback: "BD",
    bio: "Minimalist interfaces",
    followersCount: "45 followers",
    isFollowing: true,
  },
];

describe("Home Suggestions Service Seam", () => {
  it("generates suggestions SWR key and matches user-related cache keys", () => {
    assert.equal(suggestionsKeys.all(), "/api/users/suggestions");
    assert.equal(isUserFollowCacheKey("/api/users/suggestions"), true);
    assert.equal(isUserFollowCacheKey("/api/users/search?q=alice"), true);
    assert.equal(isUserFollowCacheKey("/api/users/profile/alice_dev"), true);
    assert.equal(isUserFollowCacheKey("/api/threads"), false);
  });

  it("applies optimistic follow toggle and server reconciliation on suggestions", () => {
    const toggled = applyOptimisticFollowToSuggestions(sampleSuggestions, "u-10");
    assert.equal(toggled[0].isFollowing, true);
    assert.equal(toggled[1].isFollowing, true);

    const reconciled = applyOptimisticFollowToSuggestions(
      sampleSuggestions,
      "u-11",
      false
    );
    assert.equal(reconciled[1].isFollowing, false);
  });

  it("filters follow suggestions by username, displayName, or bio", () => {
    assert.equal(filterFollowSuggestions(sampleSuggestions, "").length, 2);
    const byBio = filterFollowSuggestions(sampleSuggestions, "typescript");
    assert.equal(byBio.length, 1);
    assert.equal(byBio[0].id, "u-10");
  });

  it("sends follow toggle POST request and parses isFollowing state", async () => {
    const fakeFetch: typeof fetch = async (input, init) => {
      assert.equal(String(input), "/api/users/u-10/follow");
      assert.equal(init?.method, "POST");
      return new Response(JSON.stringify({ isFollowing: true }), { status: 200 });
    };

    const res = await toggleUserFollowRequest("u-10", fakeFetch);
    assert.deepEqual(res, { isFollowing: true });
  });
});
