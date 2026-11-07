import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  profileKeys,
  resolveProfileUser,
  computeNextFollowProfileState,
  applyOptimisticFollowToConnections,
} from "./profile-service.ts";
import type { FollowerUserItem, ProfileUser } from "../types.ts";

describe("Profile Service Seam", () => {
  it("generates SWR keys for profile user, connections, and author threads", () => {
    assert.equal(
      profileKeys.userByUsername("zerochirou"),
      "/api/users/profile/zerochirou"
    );
    assert.equal(profileKeys.userByUsername(""), null);
    assert.equal(
      profileKeys.connectionsByUsername("zerochirou"),
      "/api/users/profile/zerochirou/connections"
    );
    assert.equal(profileKeys.connectionsByUsername(""), null);
    assert.equal(
      profileKeys.threadsByAuthor({ authorId: "u-1", username: "zerochirou" }),
      "/api/threads?authorId=u-1"
    );
    assert.equal(
      profileKeys.threadsByAuthor({ username: "zerochirou" }),
      "/api/threads?username=zerochirou"
    );
  });

  it("resolves profile user by merging initialUser, liveUser (SWR), session user, and overrides", () => {
    const initialUser: ProfileUser = {
      id: "u-99",
      name: "Initial Name",
      username: "initial_user",
      avatarUrl: "https://example.com/a.png",
      followersCount: 0,
      followingCount: 0,
      isSelf: false,
    };

    const liveUser: ProfileUser = {
      id: "u-99",
      name: "Initial Name",
      username: "initial_user",
      avatarUrl: "https://example.com/a.png",
      followersCount: 14,
      followingCount: 8,
      followerAvatars: ["https://example.com/f1.png"],
      isFollowing: true,
      isSelf: true,
    };

    const resolvedFromLive = resolveProfileUser({
      initialUser,
      liveUser,
      authUser: { id: "u-99", name: "Session Name", email: "a@b.com" },
      overrides: { bio: "Updated bio" },
    });
    assert.equal(resolvedFromLive.isSelf, true);
    assert.equal(resolvedFromLive.bio, "Updated bio");
    assert.equal(resolvedFromLive.followersCount, 14);
    assert.equal(resolvedFromLive.followingCount, 8);
    assert.deepEqual(resolvedFromLive.followerAvatars, [
      "https://example.com/f1.png",
    ]);

    const resolvedFromSession = resolveProfileUser({
      authUser: {
        id: "u-50",
        name: "Zero",
        email: "zero@example.com",
        username: "zerochirou",
        interests: "AI, Rust",
      },
      overrides: {},
    });
    assert.equal(resolvedFromSession.username, "zerochirou");
    assert.deepEqual(resolvedFromSession.communities, ["AI", "Rust"]);
    assert.equal(resolvedFromSession.isSelf, true);
  });

  it("computes optimistic follow state and follower count delta cleanly", () => {
    const followed = computeNextFollowProfileState(false, 10);
    assert.equal(followed.nextFollowing, true);
    assert.equal(followed.nextFollowersCount, 11);

    const unfollowed = computeNextFollowProfileState(true, 0);
    assert.equal(unfollowed.nextFollowing, false);
    assert.equal(unfollowed.nextFollowersCount, 0);
  });

  it("applies optimistic follow toggle across followers and following lists", () => {
    const sampleConnections: {
      followers: FollowerUserItem[];
      following: FollowerUserItem[];
      followersCount: number;
      followingCount: number;
    } = {
      followers: [
        {
          id: "u-1",
          username: "alice",
          fullName: "Alice",
          isFollowing: false,
        },
      ],
      following: [
        {
          id: "u-1",
          username: "alice",
          fullName: "Alice",
          isFollowing: false,
        },
        {
          id: "u-2",
          username: "bob",
          fullName: "Bob",
          isFollowing: true,
        },
      ],
      followersCount: 1,
      followingCount: 2,
    };

    const toggled = applyOptimisticFollowToConnections(sampleConnections, "u-1");
    assert.equal(toggled.followers[0].isFollowing, true);
    assert.equal(toggled.following[0].isFollowing, true);
    assert.equal(toggled.following[1].isFollowing, true);

    const reconciled = applyOptimisticFollowToConnections(
      toggled,
      "u-2",
      false
    );
    assert.equal(reconciled.following[1].isFollowing, false);
  });
});
