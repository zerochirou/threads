import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getTableColumns } from "drizzle-orm";
import * as schema from "./schema.ts";

describe("Drizzle ORM Schema Integrity & UI Feature Coverage", () => {
  it("should define all required database tables", () => {
    const expectedTables = [
      "user",
      "session",
      "account",
      "verification",
      "userLinks",
      "follows",
      "communities",
      "communityMembers",
      "threads",
      "threadMedia",
      "threadLinkPreviews",
      "polls",
      "pollOptions",
      "pollVotes",
      "threadLocations",
      "threadMusic",
      "threadLikes",
      "threadReposts",
      "threadBookmarks",
      "searchHistory",
      "userMutes",
      "threadReports",
      "userOnboardingTasks",
      "notifications",
      "conversations",
      "conversationParticipants",
      "messages",
    ] as const;

    for (const tableName of expectedTables) {
      assert.ok(
        (schema as Record<string, unknown>)[tableName],
        `Table "${tableName}" should be exported from schema`
      );
    }
  });

  it("should include all required profile extension columns on user table", () => {
    const columns = getTableColumns(schema.user) as Record<string, unknown>;
    const requiredColumns = [
      "id",
      "name",
      "email",
      "emailVerified",
      "image",
      "username",
      "bio",
      "verified",
      "hasFollowBadge",
      "isPrivate",
      "showInstagramBadge",
      "showRecentViews",
      "podcastUrl",
      "interests",
      "createdAt",
      "updatedAt",
    ];

    for (const col of requiredColumns) {
      assert.ok(columns[col], `User table should have column "${col}"`);
    }
  });

  it("should include all chaining and thread metadata columns on threads table", () => {
    const columns = getTableColumns(schema.threads) as Record<string, unknown>;
    const requiredColumns = [
      "id",
      "authorId",
      "content",
      "parentThreadId",
      "rootThreadId",
      "threadOrder",
      "replyPrivacy",
      "isDraft",
      "communityId",
      "likeCount",
      "replyCount",
      "repostCount",
      "shareCount",
      "createdAt",
      "updatedAt",
    ];

    for (const col of requiredColumns) {
      assert.ok(columns[col], `Threads table should have column "${col}"`);
    }
  });

  it("should define relations for all tables", () => {
    const expectedRelations = [
      "userRelations",
      "sessionRelations",
      "accountRelations",
      "verificationRelations",
      "userLinksRelations",
      "followsRelations",
      "communitiesRelations",
      "communityMembersRelations",
      "threadsRelations",
      "threadMediaRelations",
      "threadLinkPreviewsRelations",
      "pollsRelations",
      "pollOptionsRelations",
      "pollVotesRelations",
      "threadLocationsRelations",
      "threadMusicRelations",
      "threadLikesRelations",
      "threadRepostsRelations",
      "threadBookmarksRelations",
      "searchHistoryRelations",
      "userMutesRelations",
      "threadReportsRelations",
      "userOnboardingTasksRelations",
      "notificationsRelations",
      "conversationsRelations",
      "conversationParticipantsRelations",
      "messagesRelations",
    ];

    for (const rel of expectedRelations) {
      assert.ok(
        (schema as Record<string, unknown>)[rel],
        `Relation "${rel}" should be exported from schema`
      );
    }
  });

  it("should satisfy TypeScript type contracts for insert and select", () => {
    const sampleUserInsert: schema.NewUser = {
      id: "u_123",
      name: "Zero Chirou",
      email: "zero@example.com",
      emailVerified: true,
      username: "zerochirou",
      bio: "Software architect and engineer",
      verified: true,
      hasFollowBadge: false,
      isPrivate: false,
      showInstagramBadge: true,
      showRecentViews: true,
      podcastUrl: "https://podcast.example.com",
      interests: "Tech, AI, Systems",
    };

    assert.equal(sampleUserInsert.username, "zerochirou");
    assert.equal(sampleUserInsert.verified, true);

    const sampleThreadInsert: schema.NewThread = {
      id: "th_123",
      authorId: "u_123",
      content: "First thread post in a chain!",
      threadOrder: 0,
      replyPrivacy: "anyone",
      isDraft: false,
      likeCount: 0,
      replyCount: 0,
      repostCount: 0,
      shareCount: 0,
    };

    assert.equal(sampleThreadInsert.content, "First thread post in a chain!");
    assert.equal(sampleThreadInsert.threadOrder, 0);
  });
});
