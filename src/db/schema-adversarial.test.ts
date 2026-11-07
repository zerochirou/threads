import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
// @ts-expect-error node:sqlite is built-in in Node 22+ runtime while @types/node is v20
import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import * as schema from "./schema.ts";

// Helper to create an in-memory SQLite database initialized with schema migrations
function createTestDb() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON;");

  const migration0 = fs.readFileSync("drizzle/0000_absurd_grim_reaper.sql", "utf8");
  const migration1 = fs.readFileSync("drizzle/0001_wealthy_abomination.sql", "utf8");

  const executeMigration = (sqlText: string) => {
    const statements = sqlText
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      sqlite.exec(stmt);
    }
  };

  executeMigration(migration0);
  executeMigration(migration1);

  const db = drizzle(
    async (sqlQuery, params, method) => {
      try {
        const stmt = sqlite.prepare(sqlQuery);
        if (method === "run") {
          stmt.run(...params);
          return { rows: [] };
        }
        if (method === "get") {
          const row = stmt.get(...params) as Record<string, unknown> | undefined;
          return { rows: (row ? Object.values(row) : undefined) as any };
        }
        const rows = stmt.all(...params) as Record<string, unknown>[];
        return { rows: rows.map((r) => Object.values(r)) };
      } catch (err) {
        throw err;
      }
    },
    { schema }
  );

  return { sqlite, db };
}

function expectConstraintError(pattern: RegExp) {
  return (err: unknown) => {
    const error = err as { message?: string; cause?: { message?: string } };
    const msg = String(error?.message || "");
    const causeMsg = String(error?.cause?.message || "");
    return pattern.test(msg) || pattern.test(causeMsg);
  };
}

describe("Adversarial Schema & Relational Query Verification", () => {
  let sqlite: DatabaseSync;
  let db: ReturnType<typeof createTestDb>["db"];

  beforeEach(() => {
    const ctx = createTestDb();
    sqlite = ctx.sqlite;
    db = ctx.db;
  });

  // ==========================================================================
  // Section 1: Better Auth Integration & Profile Defaults
  // ==========================================================================
  describe("Section 1: Better Auth Compatibility & Profile Defaults", () => {
    it("should allow standard Better Auth user sign-up with only core fields", async () => {
      const now = new Date();
      // Better Auth inserts only core fields during sign-up
      await db.insert(schema.user).values({
        id: "usr_core_1",
        name: "Core User",
        email: "core@example.com",
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
      });

      const inserted = await db.query.user.findFirst({
        where: eq(schema.user.id, "usr_core_1"),
      });

      assert.ok(inserted, "User should be found in database");
      assert.equal(inserted.name, "Core User");
      assert.equal(inserted.email, "core@example.com");
      assert.equal(inserted.emailVerified, false);

      // Verify extended fields properly defaulted or nullable
      assert.equal(inserted.username, null);
      assert.equal(inserted.bio, null);
      assert.equal(inserted.verified, false);
      assert.equal(inserted.hasFollowBadge, false);
      assert.equal(inserted.isPrivate, false);
      assert.equal(inserted.showInstagramBadge, false);
      assert.equal(inserted.showRecentViews, false);
      assert.equal(inserted.podcastUrl, null);
      assert.equal(inserted.interests, null);
    });

    it("should support Better Auth OAuth account linking and session lifecycle", async () => {
      const now = new Date();
      await db.insert(schema.user).values({
        id: "usr_oauth_1",
        name: "OAuth User",
        email: "oauth@example.com",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });

      // Insert account (Google OAuth)
      await db.insert(schema.account).values({
        id: "acc_1",
        accountId: "google_12345",
        providerId: "google",
        userId: "usr_oauth_1",
        accessToken: "mock_access_token",
        refreshToken: "mock_refresh_token",
        scope: "read,write",
        createdAt: now,
        updatedAt: now,
      });

      // Insert session
      const expiresAt = new Date(Date.now() + 86400000);
      await db.insert(schema.session).values({
        id: "sess_1",
        userId: "usr_oauth_1",
        token: "tok_random_session_123",
        expiresAt,
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
        createdAt: now,
        updatedAt: now,
      });

      // Insert verification record
      await db.insert(schema.verification).values({
        id: "verif_1",
        identifier: "oauth@example.com",
        value: "654321",
        expiresAt,
        createdAt: now,
        updatedAt: now,
      });

      // Relational lookup for user sessions and accounts
      const userWithAuth = await db.query.user.findFirst({
        where: eq(schema.user.id, "usr_oauth_1"),
        with: {
          accounts: true,
          sessions: true,
        },
      });

      assert.ok(userWithAuth);
      assert.equal(userWithAuth.accounts.length, 1);
      assert.equal(userWithAuth.accounts[0].providerId, "google");
      assert.equal(userWithAuth.sessions.length, 1);
      assert.equal(userWithAuth.sessions[0].token, "tok_random_session_123");
    });

    it("should seamlessly execute real Better Auth instance signUpEmail and session generation", async () => {
      const auth = betterAuth({
        database: drizzleAdapter(db, {
          provider: "sqlite",
          schema,
        }),
        secret: "super_secret_test_key_minimum_32_chars!",
        baseURL: "http://localhost:3000",
        emailAndPassword: { enabled: true },
      });

      const res = await auth.api.signUpEmail({
        body: {
          name: "Live Better Auth User",
          email: "live_ba@test.com",
          password: "SuperSecretPassword123!",
        },
      });

      assert.ok(res, "Sign-up response should be returned");
      assert.ok(res.user.id, "User ID should be generated");
      assert.equal(res.user.email, "live_ba@test.com");
      assert.equal(res.user.name, "Live Better Auth User");

      // Verify in DB that defaults were accurately set
      const userInDb = await db.query.user.findFirst({
        where: eq(schema.user.id, res.user.id),
      });

      assert.ok(userInDb);
      assert.equal(userInDb.verified, false);
      assert.equal(userInDb.hasFollowBadge, false);
      assert.equal(userInDb.isPrivate, false);
      assert.equal(userInDb.username, null);
      assert.equal(userInDb.bio, null);
    });

    it("should reject duplicate email and duplicate username with unique constraints", async () => {
      const now = new Date();
      await db.insert(schema.user).values({
        id: "u1",
        name: "User 1",
        email: "unique@example.com",
        username: "unique_handle",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });

      // Duplicate email attempt
      await assert.rejects(
        async () => {
          await db.insert(schema.user).values({
            id: "u2",
            name: "User 2",
            email: "unique@example.com",
            username: "other_handle",
            emailVerified: false,
            createdAt: now,
            updatedAt: now,
          });
        },
        expectConstraintError(/UNIQUE constraint failed/)
      );

      // Duplicate username attempt
      await assert.rejects(
        async () => {
          await db.insert(schema.user).values({
            id: "u3",
            name: "User 3",
            email: "other@example.com",
            username: "unique_handle",
            emailVerified: false,
            createdAt: now,
            updatedAt: now,
          });
        },
        expectConstraintError(/UNIQUE constraint failed/)
      );
    });
  });

  // ==========================================================================
  // Section 2: Disambiguated Multi-FK & Self-Referencing Relations
  // ==========================================================================
  describe("Section 2: Disambiguated Multi-FK & Self-Referencing Relations", () => {
    it("should correctly disambiguate follower vs following social graph relations", async () => {
      const now = new Date();
      // Setup 3 users: Alice (uA), Bob (uB), Charlie (uC)
      await db.insert(schema.user).values([
        { id: "uA", name: "Alice", email: "alice@test.com", emailVerified: true, createdAt: now, updatedAt: now },
        { id: "uB", name: "Bob", email: "bob@test.com", emailVerified: true, createdAt: now, updatedAt: now },
        { id: "uC", name: "Charlie", email: "charlie@test.com", emailVerified: true, createdAt: now, updatedAt: now },
      ]);

      // Alice follows Bob; Bob follows Charlie; Charlie follows Alice
      await db.insert(schema.follows).values([
        { id: "f1", followerId: "uA", followingId: "uB", status: "accepted", createdAt: now },
        { id: "f2", followerId: "uB", followingId: "uC", status: "accepted", createdAt: now },
        { id: "f3", followerId: "uC", followingId: "uA", status: "accepted", createdAt: now },
      ]);

      // Query Alice: Alice is following Bob, and Alice's followers is Charlie
      const alice = await db.query.user.findFirst({
        where: eq(schema.user.id, "uA"),
        with: {
          following: { with: { following: true } },
          followers: { with: { follower: true } },
        },
      });

      assert.ok(alice);
      assert.equal(alice.following.length, 1);
      assert.equal(alice.following[0].following.name, "Bob", "Alice should be following Bob");
      assert.equal(alice.followers.length, 1);
      assert.equal(alice.followers[0].follower.name, "Charlie", "Alice's follower should be Charlie");

      // Query Bob: Bob is following Charlie, and Bob's followers is Alice
      const bob = await db.query.user.findFirst({
        where: eq(schema.user.id, "uB"),
        with: {
          following: { with: { following: true } },
          followers: { with: { follower: true } },
        },
      });

      assert.ok(bob);
      assert.equal(bob.following.length, 1);
      assert.equal(bob.following[0].following.name, "Charlie", "Bob should be following Charlie");
      assert.equal(bob.followers.length, 1);
      assert.equal(bob.followers[0].follower.name, "Alice", "Bob's follower should be Alice");

      // Duplicate follow rejection
      await assert.rejects(
        async () => {
          await db.insert(schema.follows).values({
            id: "f4",
            followerId: "uA",
            followingId: "uB",
            status: "accepted",
            createdAt: now,
          });
        },
        expectConstraintError(/UNIQUE constraint failed/)
      );
    });

    it("should correctly disambiguate muter vs muted in user mutes", async () => {
      const now = new Date();
      await db.insert(schema.user).values([
        { id: "u1", name: "User 1", email: "u1@test.com", emailVerified: true, createdAt: now, updatedAt: now },
        { id: "u2", name: "User 2", email: "u2@test.com", emailVerified: true, createdAt: now, updatedAt: now },
      ]);

      // u1 mutes u2
      await db.insert(schema.userMutes).values({
        id: "mute_1",
        muterId: "u1",
        mutedUserId: "u2",
        createdAt: now,
      });

      const u1 = await db.query.user.findFirst({
        where: eq(schema.user.id, "u1"),
        with: {
          mutesSent: { with: { mutedUser: true } },
          mutesReceived: { with: { muter: true } },
        },
      });

      assert.ok(u1);
      assert.equal(u1.mutesSent.length, 1);
      assert.equal(u1.mutesSent[0].mutedUser.id, "u2");
      assert.equal(u1.mutesReceived.length, 0);

      const u2 = await db.query.user.findFirst({
        where: eq(schema.user.id, "u2"),
        with: {
          mutesSent: { with: { mutedUser: true } },
          mutesReceived: { with: { muter: true } },
        },
      });

      assert.ok(u2);
      assert.equal(u2.mutesSent.length, 0);
      assert.equal(u2.mutesReceived.length, 1);
      assert.equal(u2.mutesReceived[0].muter.id, "u1");
    });

    it("should correctly disambiguate actor vs recipient in notifications", async () => {
      const now = new Date();
      await db.insert(schema.user).values([
        { id: "u1", name: "User 1", email: "u1@test.com", emailVerified: true, createdAt: now, updatedAt: now },
        { id: "u2", name: "User 2", email: "u2@test.com", emailVerified: true, createdAt: now, updatedAt: now },
      ]);

      // u1 likes u2's post -> notification to u2 from actor u1
      await db.insert(schema.notifications).values({
        id: "notif_1",
        recipientId: "u2",
        actorId: "u1",
        type: "like",
        createdAt: now,
      });

      const u2 = await db.query.user.findFirst({
        where: eq(schema.user.id, "u2"),
        with: {
          notificationsReceived: { with: { actor: true } },
          notificationsSent: { with: { recipient: true } },
        },
      });

      assert.ok(u2);
      assert.equal(u2.notificationsReceived.length, 1);
      assert.equal(u2.notificationsReceived[0].actor.id, "u1");
      assert.equal(u2.notificationsSent.length, 0);

      const u1 = await db.query.user.findFirst({
        where: eq(schema.user.id, "u1"),
        with: {
          notificationsReceived: { with: { actor: true } },
          notificationsSent: { with: { recipient: true } },
        },
      });

      assert.ok(u1);
      assert.equal(u1.notificationsSent.length, 1);
      assert.equal(u1.notificationsSent[0].recipient.id, "u2");
      assert.equal(u1.notificationsReceived.length, 0);
    });

    it("should correctly disambiguate user vs targetUser in searchHistory", async () => {
      const now = new Date();
      await db.insert(schema.user).values([
        { id: "u1", name: "Searcher", email: "searcher@test.com", emailVerified: true, createdAt: now, updatedAt: now },
        { id: "u2", name: "Target", email: "target@test.com", emailVerified: true, createdAt: now, updatedAt: now },
      ]);

      await db.insert(schema.searchHistory).values({
        id: "sh_1",
        userId: "u1",
        targetUserId: "u2",
        query: "@target",
        createdAt: now,
      });

      const searcher = await db.query.user.findFirst({
        where: eq(schema.user.id, "u1"),
        with: {
          searchHistory: { with: { targetUser: true } },
          searchedAsTarget: { with: { user: true } },
        },
      });

      assert.ok(searcher);
      assert.equal(searcher.searchHistory.length, 1);
      assert.equal(searcher.searchHistory[0].targetUser?.name, "Target");
      assert.equal(searcher.searchedAsTarget.length, 0);

      const target = await db.query.user.findFirst({
        where: eq(schema.user.id, "u2"),
        with: {
          searchHistory: { with: { targetUser: true } },
          searchedAsTarget: { with: { user: true } },
        },
      });

      assert.ok(target);
      assert.equal(target.searchedAsTarget.length, 1);
      assert.equal(target.searchedAsTarget[0].user.name, "Searcher");
      assert.equal(target.searchHistory.length, 0);
    });

    it("should correctly resolve self-referencing parentThread, replies, rootThread, and rootReplies hierarchy", async () => {
      const now = new Date();
      await db.insert(schema.user).values({
        id: "u_author",
        name: "Author",
        email: "author@test.com",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });

      // T1: Root post
      await db.insert(schema.threads).values({
        id: "t_root",
        authorId: "u_author",
        content: "Root Thread Content",
        threadOrder: 0,
        createdAt: now,
        updatedAt: now,
      });

      // T2: Direct reply to T1
      await db.insert(schema.threads).values({
        id: "t_reply_1",
        authorId: "u_author",
        content: "First Reply to Root",
        parentThreadId: "t_root",
        rootThreadId: "t_root",
        threadOrder: 1,
        createdAt: now,
        updatedAt: now,
      });

      // T3: Nested reply to T2
      await db.insert(schema.threads).values({
        id: "t_reply_2",
        authorId: "u_author",
        content: "Nested Reply to T2",
        parentThreadId: "t_reply_1",
        rootThreadId: "t_root",
        threadOrder: 2,
        createdAt: now,
        updatedAt: now,
      });

      // Query root thread
      const root = await db.query.threads.findFirst({
        where: eq(schema.threads.id, "t_root"),
        with: {
          replies: true,
          rootReplies: true,
          parentThread: true,
          rootThread: true,
        },
      });

      assert.ok(root);
      assert.equal(root.parentThread, null);
      assert.equal(root.rootThread, null);
      assert.equal(root.replies.length, 1, "Root should have 1 direct reply (t_reply_1)");
      assert.equal(root.replies[0].id, "t_reply_1");
      assert.equal(root.rootReplies.length, 2, "Root should have 2 rootReplies (t_reply_1 and t_reply_2)");

      // Query direct reply t_reply_1
      const reply1 = await db.query.threads.findFirst({
        where: eq(schema.threads.id, "t_reply_1"),
        with: {
          parentThread: true,
          rootThread: true,
          replies: true,
        },
      });

      assert.ok(reply1);
      assert.equal(reply1.parentThread?.id, "t_root");
      assert.equal(reply1.rootThread?.id, "t_root");
      assert.equal(reply1.replies.length, 1);
      assert.equal(reply1.replies[0].id, "t_reply_2");
    });
  });

  // ==========================================================================
  // Section 3: Deep Nested Relational Queries
  // ==========================================================================
  describe("Section 3: Deep Nested Relational Queries", () => {
    it("should execute full multi-level nested queries with attachments, polls, likes, and replies", async () => {
      const now = new Date();
      // Setup users
      await db.insert(schema.user).values([
        { id: "u_op", name: "OP Author", email: "op@test.com", emailVerified: true, createdAt: now, updatedAt: now },
        { id: "u_liker", name: "Liker", email: "liker@test.com", emailVerified: true, createdAt: now, updatedAt: now },
        { id: "u_voter", name: "Voter", email: "voter@test.com", emailVerified: true, createdAt: now, updatedAt: now },
      ]);

      // User link
      await db.insert(schema.userLinks).values({
        id: "link_1",
        userId: "u_op",
        label: "Website",
        url: "https://example.com",
        orderIndex: 0,
        createdAt: now,
      });

      // Community
      await db.insert(schema.communities).values({
        id: "comm_tech",
        slug: "tech",
        name: "Technology",
        description: "All things code",
        createdAt: now,
      });

      await db.insert(schema.communityMembers).values({
        id: "cm_1",
        communityId: "comm_tech",
        userId: "u_op",
        role: "admin",
        joinedAt: now,
      });

      // Thread
      await db.insert(schema.threads).values({
        id: "t_main",
        authorId: "u_op",
        communityId: "comm_tech",
        content: "Deep nested thread test content with all features!",
        replyPrivacy: "anyone",
        createdAt: now,
        updatedAt: now,
      });

      // Media attachments
      await db.insert(schema.threadMedia).values([
        {
          id: "m_1",
          threadId: "t_main",
          type: "image",
          url: "https://cdn.example.com/photo.jpg",
          width: 1920,
          height: 1080,
          orderIndex: 0,
          createdAt: now,
        },
        {
          id: "m_2",
          threadId: "t_main",
          type: "voice_note",
          url: "https://cdn.example.com/audio.mp3",
          durationSeconds: 45,
          orderIndex: 1,
          createdAt: now,
        },
      ]);

      // Link preview
      await db.insert(schema.threadLinkPreviews).values({
        id: "lp_1",
        threadId: "t_main",
        domain: "github.com",
        url: "https://github.com/project",
        title: "Project Repository",
        headline: "Code base",
        createdAt: now,
      });

      // Location & Music
      await db.insert(schema.threadLocations).values({
        id: "loc_1",
        threadId: "t_main",
        name: "Tokyo, Japan",
        latitude: "35.6762",
        longitude: "139.6503",
      });

      await db.insert(schema.threadMusic).values({
        id: "mus_1",
        threadId: "t_main",
        title: "Midnight City",
        artist: "M83",
      });

      // Poll, Options, and Votes
      await db.insert(schema.polls).values({
        id: "poll_1",
        threadId: "t_main",
        question: "Is Drizzle ORM great?",
        createdAt: now,
      });

      await db.insert(schema.pollOptions).values([
        { id: "opt_yes", pollId: "poll_1", optionText: "Yes, absolutely", orderIndex: 0 },
        { id: "opt_no", pollId: "poll_1", optionText: "No", orderIndex: 1 },
      ]);

      await db.insert(schema.pollVotes).values({
        id: "vote_1",
        pollId: "poll_1",
        pollOptionId: "opt_yes",
        userId: "u_voter",
        createdAt: now,
      });

      // Social Interactions: Likes, Reposts, Bookmarks
      await db.insert(schema.threadLikes).values({
        id: "like_1",
        threadId: "t_main",
        userId: "u_liker",
        createdAt: now,
      });

      await db.insert(schema.threadReposts).values({
        id: "repost_1",
        threadId: "t_main",
        userId: "u_liker",
        quoteContent: "Great thread!",
        createdAt: now,
      });

      await db.insert(schema.threadBookmarks).values({
        id: "bm_1",
        threadId: "t_main",
        userId: "u_liker",
        createdAt: now,
      });

      // Reply
      await db.insert(schema.threads).values({
        id: "t_sub_reply",
        authorId: "u_liker",
        parentThreadId: "t_main",
        rootThreadId: "t_main",
        content: "Awesome post!",
        createdAt: now,
        updatedAt: now,
      });

      // EXECUTE THE DEEP RELATIONAL QUERY
      const result = await db.query.threads.findFirst({
        where: eq(schema.threads.id, "t_main"),
        with: {
          author: {
            with: {
              links: true,
            },
          },
          community: {
            with: {
              members: {
                with: {
                  user: true,
                },
              },
            },
          },
          media: true,
          linkPreview: true,
          location: true,
          music: true,
          poll: {
            with: {
              options: {
                with: {
                  votes: {
                    with: {
                      user: true,
                    },
                  },
                },
              },
              votes: {
                with: {
                  user: true,
                  option: true,
                },
              },
            },
          },
          likes: {
            with: {
              user: true,
            },
          },
          reposts: {
            with: {
              user: true,
            },
          },
          bookmarks: {
            with: {
              user: true,
            },
          },
          replies: {
            with: {
              author: true,
            },
          },
        },
      });

      assert.ok(result, "Deep relational query must return thread object");
      assert.equal(result.id, "t_main");

      // Verify Author
      assert.equal(result.author.id, "u_op");
      assert.equal(result.author.links.length, 1);
      assert.equal(result.author.links[0].label, "Website");

      // Verify Community
      assert.ok(result.community);
      assert.equal(result.community.slug, "tech");
      assert.equal(result.community.members.length, 1);
      assert.equal(result.community.members[0].user.name, "OP Author");

      // Verify Attachments
      assert.equal(result.media.length, 2);
      assert.equal(result.media[0].type, "image");
      assert.equal(result.linkPreview?.domain, "github.com");
      assert.equal(result.location?.name, "Tokyo, Japan");
      assert.equal(result.music?.artist, "M83");

      // Verify Poll and nested votes
      assert.ok(result.poll);
      assert.equal(result.poll.options.length, 2);
      assert.equal(result.poll.votes.length, 1);
      assert.equal(result.poll.votes[0].user.name, "Voter");
      assert.equal(result.poll.votes[0].option.optionText, "Yes, absolutely");

      // Verify Likes, Reposts, Bookmarks
      assert.equal(result.likes.length, 1);
      assert.equal(result.likes[0].user.name, "Liker");
      assert.equal(result.reposts.length, 1);
      assert.equal(result.reposts[0].quoteContent, "Great thread!");
      assert.equal(result.bookmarks.length, 1);

      // Verify Replies
      assert.equal(result.replies.length, 1);
      assert.equal(result.replies[0].author.name, "Liker");
    });
  });

  // ==========================================================================
  // Section 4: Direct Messaging & Conversations Relational Queries
  // ==========================================================================
  describe("Section 4: Direct Messaging Relational Queries", () => {
    it("should resolve conversations with participants and message senders", async () => {
      const now = new Date();
      await db.insert(schema.user).values([
        { id: "u_msg_1", name: "User 1", email: "msg1@test.com", emailVerified: true, createdAt: now, updatedAt: now },
        { id: "u_msg_2", name: "User 2", email: "msg2@test.com", emailVerified: true, createdAt: now, updatedAt: now },
      ]);

      await db.insert(schema.conversations).values({
        id: "conv_1",
        type: "direct",
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.conversationParticipants).values([
        { id: "cp_1", conversationId: "conv_1", userId: "u_msg_1", joinedAt: now },
        { id: "cp_2", conversationId: "conv_1", userId: "u_msg_2", joinedAt: now },
      ]);

      await db.insert(schema.messages).values([
        { id: "m1", conversationId: "conv_1", senderId: "u_msg_1", content: "Hey there!", createdAt: now },
        { id: "m2", conversationId: "conv_1", senderId: "u_msg_2", content: "Hello! How are you?", createdAt: now },
      ]);

      const conv = await db.query.conversations.findFirst({
        where: eq(schema.conversations.id, "conv_1"),
        with: {
          participants: {
            with: {
              user: true,
            },
          },
          messages: {
            with: {
              sender: true,
            },
          },
        },
      });

      assert.ok(conv);
      assert.equal(conv.participants.length, 2);
      assert.equal(conv.messages.length, 2);
      assert.equal(conv.messages[0].sender.id, "u_msg_1");
      assert.equal(conv.messages[1].sender.id, "u_msg_2");
    });
  });

  // ==========================================================================
  // Section 5: Adversarial Edge Cases & Integrity Stress Tests
  // ==========================================================================
  describe("Section 5: Adversarial Edge Cases & Integrity Constraints", () => {
    it("should strictly enforce foreign key constraints with PRAGMA foreign_keys = ON", async () => {
      const now = new Date();

      // Attempt to insert thread with invalid authorId
      await assert.rejects(
        async () => {
          await db.insert(schema.threads).values({
            id: "t_orphan",
            authorId: "non_existent_user",
            content: "Should fail FK",
            createdAt: now,
            updatedAt: now,
          });
        },
        expectConstraintError(/FOREIGN KEY constraint failed/)
      );

      // Attempt to insert threadMedia with invalid threadId
      await assert.rejects(
        async () => {
          await db.insert(schema.threadMedia).values({
            id: "media_orphan",
            threadId: "non_existent_thread",
            type: "image",
            url: "https://example.com/test.jpg",
            createdAt: now,
          });
        },
        expectConstraintError(/FOREIGN KEY constraint failed/)
      );

      // Attempt to insert pollVote with invalid pollOptionId
      await db.insert(schema.user).values({
        id: "u_valid",
        name: "Valid User",
        email: "valid@test.com",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(schema.threads).values({
        id: "t_valid",
        authorId: "u_valid",
        content: "Valid thread",
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(schema.polls).values({
        id: "poll_valid",
        threadId: "t_valid",
        question: "Q?",
        createdAt: now,
      });

      await assert.rejects(
        async () => {
          await db.insert(schema.pollVotes).values({
            id: "vote_invalid",
            pollId: "poll_valid",
            pollOptionId: "non_existent_option",
            userId: "u_valid",
            createdAt: now,
          });
        },
        expectConstraintError(/FOREIGN KEY constraint failed/)
      );
    });

    it("should cascade-delete all dependent records when user or thread is deleted", async () => {
      const now = new Date();
      await db.insert(schema.user).values({
        id: "u_delete_me",
        name: "To Delete",
        email: "delete@test.com",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.userLinks).values({
        id: "link_del",
        userId: "u_delete_me",
        label: "Link",
        url: "https://delete.com",
        createdAt: now,
      });

      await db.insert(schema.threads).values({
        id: "t_del",
        authorId: "u_delete_me",
        content: "Thread to be cascaded",
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.threadMedia).values({
        id: "m_del",
        threadId: "t_del",
        type: "image",
        url: "https://cdn.example.com/del.png",
        createdAt: now,
      });

      await db.insert(schema.threadLikes).values({
        id: "l_del",
        threadId: "t_del",
        userId: "u_delete_me",
        createdAt: now,
      });

      // Verify records exist before delete
      const linksBefore = await db.select().from(schema.userLinks).where(eq(schema.userLinks.id, "link_del"));
      const threadsBefore = await db.select().from(schema.threads).where(eq(schema.threads.id, "t_del"));
      const mediaBefore = await db.select().from(schema.threadMedia).where(eq(schema.threadMedia.id, "m_del"));
      const likesBefore = await db.select().from(schema.threadLikes).where(eq(schema.threadLikes.id, "l_del"));

      assert.equal(linksBefore.length, 1);
      assert.equal(threadsBefore.length, 1);
      assert.equal(mediaBefore.length, 1);
      assert.equal(likesBefore.length, 1);

      // Delete the user
      await db.delete(schema.user).where(eq(schema.user.id, "u_delete_me"));

      // Verify cascade deleted everything cleanly
      const linksAfter = await db.select().from(schema.userLinks).where(eq(schema.userLinks.id, "link_del"));
      const threadsAfter = await db.select().from(schema.threads).where(eq(schema.threads.id, "t_del"));
      const mediaAfter = await db.select().from(schema.threadMedia).where(eq(schema.threadMedia.id, "m_del"));
      const likesAfter = await db.select().from(schema.threadLikes).where(eq(schema.threadLikes.id, "l_del"));

      assert.equal(linksAfter.length, 0, "userLinks must be cascaded on user delete");
      assert.equal(threadsAfter.length, 0, "threads must be cascaded on user delete");
      assert.equal(mediaAfter.length, 0, "threadMedia must be cascaded on thread delete");
      assert.equal(likesAfter.length, 0, "threadLikes must be cascaded on user delete");
    });

    it("should cascade-delete replies when parent thread is deleted", async () => {
      const now = new Date();
      await db.insert(schema.user).values({
        id: "u_cascade_test",
        name: "Cascade Author",
        email: "cascade@test.com",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.threads).values({
        id: "t_parent_cascade",
        authorId: "u_cascade_test",
        content: "Parent thread to delete",
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.threads).values({
        id: "t_reply_cascade",
        authorId: "u_cascade_test",
        parentThreadId: "t_parent_cascade",
        rootThreadId: "t_parent_cascade",
        content: "Reply thread that should cascade",
        createdAt: now,
        updatedAt: now,
      });

      // Attempt to delete parent thread
      await db.delete(schema.threads).where(eq(schema.threads.id, "t_parent_cascade"));

      const remainingReplies = await db
        .select()
        .from(schema.threads)
        .where(eq(schema.threads.id, "t_reply_cascade"));
      assert.equal(remainingReplies.length, 0, "Reply thread should be deleted via cascade");
    });

    it("should set community_id to null when community is deleted", async () => {
      const now = new Date();
      await db.insert(schema.user).values({
        id: "u_comm_test",
        name: "Comm User",
        email: "comm_user@test.com",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.communities).values({
        id: "c_to_delete",
        slug: "delete-me",
        name: "Delete Me",
        createdAt: now,
      });

      await db.insert(schema.threads).values({
        id: "t_with_comm",
        authorId: "u_comm_test",
        communityId: "c_to_delete",
        content: "Post in community",
        createdAt: now,
        updatedAt: now,
      });

      // Delete community
      await db.delete(schema.communities).where(eq(schema.communities.id, "c_to_delete"));

      const thread = await db.query.threads.findFirst({
        where: eq(schema.threads.id, "t_with_comm"),
      });

      assert.ok(thread);
      assert.equal(thread.communityId, null, "communityId should be set to null on community deletion");
    });

    it("should enforce unique compound constraints against duplicate likes, bookmarks, and poll votes", async () => {
      const now = new Date();
      await db.insert(schema.user).values({
        id: "u_unique",
        name: "User",
        email: "unique_test@test.com",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.threads).values({
        id: "t_unique",
        authorId: "u_unique",
        content: "Unique constraint thread",
        createdAt: now,
        updatedAt: now,
      });

      // Like once
      await db.insert(schema.threadLikes).values({
        id: "like_first",
        userId: "u_unique",
        threadId: "t_unique",
        createdAt: now,
      });

      // Duplicate like
      await assert.rejects(
        async () => {
          await db.insert(schema.threadLikes).values({
            id: "like_second",
            userId: "u_unique",
            threadId: "t_unique",
            createdAt: now,
          });
        },
        expectConstraintError(/UNIQUE constraint failed/)
      );

      // Bookmark once
      await db.insert(schema.threadBookmarks).values({
        id: "bm_first",
        userId: "u_unique",
        threadId: "t_unique",
        createdAt: now,
      });

      // Duplicate bookmark
      await assert.rejects(
        async () => {
          await db.insert(schema.threadBookmarks).values({
            id: "bm_second",
            userId: "u_unique",
            threadId: "t_unique",
            createdAt: now,
          });
        },
        expectConstraintError(/UNIQUE constraint failed/)
      );

      // Poll vote duplicate
      await db.insert(schema.polls).values({
        id: "poll_u",
        threadId: "t_unique",
        question: "Vote?",
        createdAt: now,
      });
      await db.insert(schema.pollOptions).values([
        { id: "po_1", pollId: "poll_u", optionText: "1", orderIndex: 0 },
        { id: "po_2", pollId: "poll_u", optionText: "2", orderIndex: 1 },
      ]);
      await db.insert(schema.pollVotes).values({
        id: "pv_1",
        pollId: "poll_u",
        pollOptionId: "po_1",
        userId: "u_unique",
        createdAt: now,
      });

      await assert.rejects(
        async () => {
          await db.insert(schema.pollVotes).values({
            id: "pv_2",
            pollId: "poll_u",
            pollOptionId: "po_2",
            userId: "u_unique",
            createdAt: now,
          });
        },
        expectConstraintError(/UNIQUE constraint failed/)
      );
    });

    it("should handle multi-byte Unicode, emojis, RTL text, XSS payloads, and long text bodies safely", async () => {
      const now = new Date();
      await db.insert(schema.user).values({
        id: "u_edge",
        name: "Edge 👩‍🔬",
        email: "edge@test.com",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });

      const exoticContent = [
        "Emoji stress: 👨‍👩‍👧‍👦 🚀 🧵 🔥 💯 🌈 🪐 🇯🇵 🇺🇸",
        "RTL & Arabic/Hebrew: مرحبا بالعالم! שלום עולם!",
        "Zero-width joiners: a\u200Db\u200Cc\uFEFFd",
        "XSS & Injection payload: <script>alert('threads');</script> ' OR 1=1; DROP TABLE threads; --",
        "A".repeat(15000), // 15,000 characters long string
      ].join("\n");

      await db.insert(schema.threads).values({
        id: "t_exotic",
        authorId: "u_edge",
        content: exoticContent,
        createdAt: now,
        updatedAt: now,
      });

      const retrieved = await db.query.threads.findFirst({
        where: eq(schema.threads.id, "t_exotic"),
      });

      assert.ok(retrieved);
      assert.equal(retrieved.content, exoticContent, "Exotic unicode, XSS, and long string must preserve byte-for-byte fidelity");
    });

    it("should handle deep 20-level nested reply chain without stack overflow or query failure", async () => {
      const now = new Date();
      await db.insert(schema.user).values({
        id: "u_chain",
        name: "Chain Author",
        email: "chain@test.com",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });

      const CHAIN_DEPTH = 20;
      const rootId = "chain_0";

      // Insert root
      await db.insert(schema.threads).values({
        id: rootId,
        authorId: "u_chain",
        content: "Root level 0",
        threadOrder: 0,
        createdAt: now,
        updatedAt: now,
      });

      // Insert 19 sequential replies
      for (let i = 1; i < CHAIN_DEPTH; i++) {
        await db.insert(schema.threads).values({
          id: `chain_${i}`,
          authorId: "u_chain",
          content: `Reply level ${i}`,
          parentThreadId: `chain_${i - 1}`,
          rootThreadId: rootId,
          threadOrder: i,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Query root and verify rootReplies
      const root = await db.query.threads.findFirst({
        where: eq(schema.threads.id, rootId),
        with: {
          rootReplies: true,
        },
      });

      assert.ok(root);
      assert.equal(root.rootReplies.length, 19, "Root must have all 19 descendant replies via rootReplies");

      // Query the deepest leaf
      const leaf = await db.query.threads.findFirst({
        where: eq(schema.threads.id, `chain_${CHAIN_DEPTH - 1}`),
        with: {
          parentThread: true,
          rootThread: true,
        },
      });

      assert.ok(leaf);
      assert.equal(leaf.parentThread?.id, `chain_${CHAIN_DEPTH - 2}`);
      assert.equal(leaf.rootThread?.id, rootId);
    });
  });
});
