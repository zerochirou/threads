import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

// ============================================================================
// 1. Core Authentication & User Profile
// ============================================================================

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  username: text("username").unique(),
  bio: text("bio"),
  verified: integer("verified", { mode: "boolean" }).default(false).notNull(),
  hasFollowBadge: integer("has_follow_badge", { mode: "boolean" })
    .default(false)
    .notNull(),
  isPrivate: integer("is_private", { mode: "boolean" }).default(false).notNull(),
  showInstagramBadge: integer("show_instagram_badge", { mode: "boolean" })
    .default(false)
    .notNull(),
  showRecentViews: integer("show_recent_views", { mode: "boolean" })
    .default(false)
    .notNull(),
  podcastUrl: text("podcast_url"),
  interests: text("interests"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refreshToken_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const userLinks = sqliteTable(
  "user_links",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    url: text("url").notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("user_links_userId_idx").on(table.userId)]
);

// ============================================================================
// 2. Social Graph (Follows & Relationships)
// ============================================================================

export const follows = sqliteTable(
  "follows",
  {
    id: text("id").primaryKey(),
    followerId: text("follower_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").default("accepted").notNull(), // 'pending' | 'accepted'
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("follows_follower_following_unique").on(
      table.followerId,
      table.followingId
    ),
    index("follows_followerId_idx").on(table.followerId),
    index("follows_followingId_idx").on(table.followingId),
  ]
);

// ============================================================================
// 3. Communities & Memberships
// ============================================================================

export const communities = sqliteTable(
  "communities",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),
    bannerUrl: text("banner_url"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [uniqueIndex("communities_slug_unique").on(table.slug)]
);

export const communityMembers = sqliteTable(
  "community_members",
  {
    id: text("id").primaryKey(),
    communityId: text("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(), // 'member' | 'moderator' | 'admin'
    joinedAt: integer("joined_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("community_members_community_user_unique").on(
      table.communityId,
      table.userId
    ),
    index("community_members_userId_idx").on(table.userId),
  ]
);

// ============================================================================
// 4. Threads, Replies & Post Chains
// ============================================================================

export const threads = sqliteTable(
  "threads",
  {
    id: text("id").primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    parentThreadId: text("parent_thread_id").references(
      (): AnySQLiteColumn => threads.id,
      { onDelete: "cascade" }
    ),
    rootThreadId: text("root_thread_id").references(
      (): AnySQLiteColumn => threads.id,
      { onDelete: "cascade" }
    ),
    threadOrder: integer("thread_order").default(0).notNull(),
    replyPrivacy: text("reply_privacy").default("anyone").notNull(), // 'anyone' | 'following' | 'mentioned'
    isDraft: integer("is_draft", { mode: "boolean" }).default(false).notNull(),
    communityId: text("community_id").references(() => communities.id, {
      onDelete: "set null",
    }),
    likeCount: integer("like_count").default(0).notNull(),
    replyCount: integer("reply_count").default(0).notNull(),
    repostCount: integer("repost_count").default(0).notNull(),
    shareCount: integer("share_count").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("threads_authorId_idx").on(table.authorId),
    index("threads_parentThreadId_idx").on(table.parentThreadId),
    index("threads_rootThreadId_idx").on(table.rootThreadId),
    index("threads_communityId_idx").on(table.communityId),
    index("threads_createdAt_idx").on(table.createdAt),
  ]
);

// ============================================================================
// 5. Rich Attachments, Polls, Locations, Music & Link Previews
// ============================================================================

export const threadMedia = sqliteTable(
  "thread_media",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'image' | 'video' | 'gif' | 'audio' | 'voice_note'
    url: text("url").notNull(),
    mimeType: text("mime_type"),
    width: integer("width"),
    height: integer("height"),
    durationSeconds: integer("duration_seconds"),
    orderIndex: integer("order_index").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("thread_media_threadId_idx").on(table.threadId)]
);

export const threadLinkPreviews = sqliteTable(
  "thread_link_previews",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    domain: text("domain").notNull(),
    title: text("title"),
    headline: text("headline"),
    subheadline: text("subheadline"),
    tagline: text("tagline"),
    imageUrl: text("image_url"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("thread_link_previews_threadId_idx").on(table.threadId)]
);

export const polls = sqliteTable(
  "polls",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("polls_threadId_idx").on(table.threadId)]
);

export const pollOptions = sqliteTable(
  "poll_options",
  {
    id: text("id").primaryKey(),
    pollId: text("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    optionText: text("option_text").notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
  },
  (table) => [index("poll_options_pollId_idx").on(table.pollId)]
);

export const pollVotes = sqliteTable(
  "poll_votes",
  {
    id: text("id").primaryKey(),
    pollId: text("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    pollOptionId: text("poll_option_id")
      .notNull()
      .references(() => pollOptions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("poll_votes_poll_user_unique").on(table.pollId, table.userId),
    index("poll_votes_pollOptionId_idx").on(table.pollOptionId),
    index("poll_votes_userId_idx").on(table.userId),
  ]
);

export const threadLocations = sqliteTable(
  "thread_locations",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    latitude: text("latitude"),
    longitude: text("longitude"),
  },
  (table) => [index("thread_locations_threadId_idx").on(table.threadId)]
);

export const threadMusic = sqliteTable(
  "thread_music",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    artist: text("artist").notNull(),
    audioUrl: text("audio_url"),
    albumArtUrl: text("album_art_url"),
  },
  (table) => [index("thread_music_threadId_idx").on(table.threadId)]
);

// ============================================================================
// 6. Social Interactions (Likes, Reposts, Bookmarks)
// ============================================================================

export const threadLikes = sqliteTable(
  "thread_likes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("thread_likes_user_thread_unique").on(
      table.userId,
      table.threadId
    ),
    index("thread_likes_userId_idx").on(table.userId),
    index("thread_likes_threadId_idx").on(table.threadId),
  ]
);

export const threadReposts = sqliteTable(
  "thread_reposts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    quoteContent: text("quote_content"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("thread_reposts_user_thread_unique").on(
      table.userId,
      table.threadId
    ),
    index("thread_reposts_userId_idx").on(table.userId),
    index("thread_reposts_threadId_idx").on(table.threadId),
  ]
);

export const threadBookmarks = sqliteTable(
  "thread_bookmarks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("thread_bookmarks_user_thread_unique").on(
      table.userId,
      table.threadId
    ),
    index("thread_bookmarks_userId_idx").on(table.userId),
    index("thread_bookmarks_threadId_idx").on(table.threadId),
  ]
);

// ============================================================================
// 7. Search History, Moderation, Onboarding & Notifications
// ============================================================================

export const searchHistory = sqliteTable(
  "search_history",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    query: text("query").notNull(),
    targetUserId: text("target_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("search_history_userId_idx").on(table.userId),
    index("search_history_createdAt_idx").on(table.createdAt),
  ]
);

export const userMutes = sqliteTable(
  "user_mutes",
  {
    id: text("id").primaryKey(),
    muterId: text("muter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mutedUserId: text("muted_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_mutes_muter_muted_unique").on(
      table.muterId,
      table.mutedUserId
    ),
    index("user_mutes_muterId_idx").on(table.muterId),
    index("user_mutes_mutedUserId_idx").on(table.mutedUserId),
  ]
);

export const threadReports = sqliteTable(
  "thread_reports",
  {
    id: text("id").primaryKey(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    status: text("status").default("pending").notNull(), // 'pending' | 'reviewed' | 'dismissed'
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("thread_reports_reporterId_idx").on(table.reporterId),
    index("thread_reports_threadId_idx").on(table.threadId),
  ]
);

export const userOnboardingTasks = sqliteTable(
  "user_onboarding_tasks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    taskKey: text("task_key").notNull(),
    isCompleted: integer("is_completed", { mode: "boolean" })
      .default(false)
      .notNull(),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    uniqueIndex("user_onboarding_tasks_user_task_unique").on(
      table.userId,
      table.taskKey
    ),
    index("user_onboarding_tasks_userId_idx").on(table.userId),
  ]
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    recipientId: text("recipient_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    actorId: text("actor_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'like' | 'reply' | 'repost' | 'follow' | 'mention'
    threadId: text("thread_id").references(() => threads.id, {
      onDelete: "cascade",
    }),
    isRead: integer("is_read", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("notifications_recipientId_idx").on(table.recipientId),
    index("notifications_actorId_idx").on(table.actorId),
    index("notifications_threadId_idx").on(table.threadId),
    index("notifications_createdAt_idx").on(table.createdAt),
  ]
);

// ============================================================================
// 8. Direct Messaging (Conversations & Messages)
// ============================================================================

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  type: text("type").default("direct").notNull(), // 'direct' | 'group'
  title: text("title"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const conversationParticipants = sqliteTable(
  "conversation_participants",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    joinedAt: integer("joined_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("conv_participants_conv_user_unique").on(
      table.conversationId,
      table.userId
    ),
    index("conv_participants_conversationId_idx").on(table.conversationId),
    index("conv_participants_userId_idx").on(table.userId),
  ]
);

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("messages_conversationId_idx").on(table.conversationId),
    index("messages_senderId_idx").on(table.senderId),
    index("messages_createdAt_idx").on(table.createdAt),
  ]
);

// ============================================================================
// Drizzle Relational Mappings
// ============================================================================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  threads: many(threads),
  links: many(userLinks),
  followers: many(follows, { relationName: "followingUser" }),
  following: many(follows, { relationName: "followerUser" }),
  likes: many(threadLikes),
  reposts: many(threadReposts),
  bookmarks: many(threadBookmarks),
  communityMemberships: many(communityMembers),
  pollVotes: many(pollVotes),
  searchHistory: many(searchHistory, { relationName: "searchHistoryUser" }),
  searchedAsTarget: many(searchHistory, { relationName: "searchHistoryTarget" }),
  mutesSent: many(userMutes, { relationName: "muterUser" }),
  mutesReceived: many(userMutes, { relationName: "mutedUser" }),
  reports: many(threadReports),
  onboardingTasks: many(userOnboardingTasks),
  notificationsReceived: many(notifications, { relationName: "recipientUser" }),
  notificationsSent: many(notifications, { relationName: "actorUser" }),
  conversationParticipants: many(conversationParticipants),
  messages: many(messages),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const verificationRelations = relations(verification, () => ({}));

export const userLinksRelations = relations(userLinks, ({ one }) => ({
  user: one(user, {
    fields: [userLinks.userId],
    references: [user.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(user, {
    fields: [follows.followerId],
    references: [user.id],
    relationName: "followerUser",
  }),
  following: one(user, {
    fields: [follows.followingId],
    references: [user.id],
    relationName: "followingUser",
  }),
}));

export const communitiesRelations = relations(communities, ({ many }) => ({
  members: many(communityMembers),
  threads: many(threads),
}));

export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
  community: one(communities, {
    fields: [communityMembers.communityId],
    references: [communities.id],
  }),
  user: one(user, {
    fields: [communityMembers.userId],
    references: [user.id],
  }),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  author: one(user, {
    fields: [threads.authorId],
    references: [user.id],
  }),
  parentThread: one(threads, {
    fields: [threads.parentThreadId],
    references: [threads.id],
    relationName: "parentReplies",
  }),
  replies: many(threads, {
    relationName: "parentReplies",
  }),
  rootThread: one(threads, {
    fields: [threads.rootThreadId],
    references: [threads.id],
    relationName: "rootReplies",
  }),
  rootReplies: many(threads, {
    relationName: "rootReplies",
  }),
  community: one(communities, {
    fields: [threads.communityId],
    references: [communities.id],
  }),
  media: many(threadMedia),
  linkPreview: one(threadLinkPreviews),
  poll: one(polls),
  location: one(threadLocations),
  music: one(threadMusic),
  likes: many(threadLikes),
  reposts: many(threadReposts),
  bookmarks: many(threadBookmarks),
  reports: many(threadReports),
  notifications: many(notifications),
}));

export const threadMediaRelations = relations(threadMedia, ({ one }) => ({
  thread: one(threads, {
    fields: [threadMedia.threadId],
    references: [threads.id],
  }),
}));

export const threadLinkPreviewsRelations = relations(
  threadLinkPreviews,
  ({ one }) => ({
    thread: one(threads, {
      fields: [threadLinkPreviews.threadId],
      references: [threads.id],
    }),
  })
);

export const pollsRelations = relations(polls, ({ one, many }) => ({
  thread: one(threads, {
    fields: [polls.threadId],
    references: [threads.id],
  }),
  options: many(pollOptions),
  votes: many(pollVotes),
}));

export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
  poll: one(polls, {
    fields: [pollOptions.pollId],
    references: [polls.id],
  }),
  votes: many(pollVotes),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  poll: one(polls, {
    fields: [pollVotes.pollId],
    references: [polls.id],
  }),
  option: one(pollOptions, {
    fields: [pollVotes.pollOptionId],
    references: [pollOptions.id],
  }),
  user: one(user, {
    fields: [pollVotes.userId],
    references: [user.id],
  }),
}));

export const threadLocationsRelations = relations(threadLocations, ({ one }) => ({
  thread: one(threads, {
    fields: [threadLocations.threadId],
    references: [threads.id],
  }),
}));

export const threadMusicRelations = relations(threadMusic, ({ one }) => ({
  thread: one(threads, {
    fields: [threadMusic.threadId],
    references: [threads.id],
  }),
}));

export const threadLikesRelations = relations(threadLikes, ({ one }) => ({
  user: one(user, {
    fields: [threadLikes.userId],
    references: [user.id],
  }),
  thread: one(threads, {
    fields: [threadLikes.threadId],
    references: [threads.id],
  }),
}));

export const threadRepostsRelations = relations(threadReposts, ({ one }) => ({
  user: one(user, {
    fields: [threadReposts.userId],
    references: [user.id],
  }),
  thread: one(threads, {
    fields: [threadReposts.threadId],
    references: [threads.id],
  }),
}));

export const threadBookmarksRelations = relations(threadBookmarks, ({ one }) => ({
  user: one(user, {
    fields: [threadBookmarks.userId],
    references: [user.id],
  }),
  thread: one(threads, {
    fields: [threadBookmarks.threadId],
    references: [threads.id],
  }),
}));

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  user: one(user, {
    fields: [searchHistory.userId],
    references: [user.id],
    relationName: "searchHistoryUser",
  }),
  targetUser: one(user, {
    fields: [searchHistory.targetUserId],
    references: [user.id],
    relationName: "searchHistoryTarget",
  }),
}));

export const userMutesRelations = relations(userMutes, ({ one }) => ({
  muter: one(user, {
    fields: [userMutes.muterId],
    references: [user.id],
    relationName: "muterUser",
  }),
  mutedUser: one(user, {
    fields: [userMutes.mutedUserId],
    references: [user.id],
    relationName: "mutedUser",
  }),
}));

export const threadReportsRelations = relations(threadReports, ({ one }) => ({
  reporter: one(user, {
    fields: [threadReports.reporterId],
    references: [user.id],
  }),
  thread: one(threads, {
    fields: [threadReports.threadId],
    references: [threads.id],
  }),
}));

export const userOnboardingTasksRelations = relations(
  userOnboardingTasks,
  ({ one }) => ({
    user: one(user, {
      fields: [userOnboardingTasks.userId],
      references: [user.id],
    }),
  })
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(user, {
    fields: [notifications.recipientId],
    references: [user.id],
    relationName: "recipientUser",
  }),
  actor: one(user, {
    fields: [notifications.actorId],
    references: [user.id],
    relationName: "actorUser",
  }),
  thread: one(threads, {
    fields: [notifications.threadId],
    references: [threads.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(user, {
      fields: [conversationParticipants.userId],
      references: [user.id],
    }),
  })
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(user, {
    fields: [messages.senderId],
    references: [user.id],
  }),
}));

// ============================================================================
// Inferred TypeScript Types
// ============================================================================

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

export type UserLink = typeof userLinks.$inferSelect;
export type NewUserLink = typeof userLinks.$inferInsert;

export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;

export type Community = typeof communities.$inferSelect;
export type NewCommunity = typeof communities.$inferInsert;

export type CommunityMember = typeof communityMembers.$inferSelect;
export type NewCommunityMember = typeof communityMembers.$inferInsert;

export type Thread = typeof threads.$inferSelect;
export type NewThread = typeof threads.$inferInsert;

export type ThreadMedia = typeof threadMedia.$inferSelect;
export type NewThreadMedia = typeof threadMedia.$inferInsert;

export type ThreadLinkPreview = typeof threadLinkPreviews.$inferSelect;
export type NewThreadLinkPreview = typeof threadLinkPreviews.$inferInsert;

export type Poll = typeof polls.$inferSelect;
export type NewPoll = typeof polls.$inferInsert;

export type PollOption = typeof pollOptions.$inferSelect;
export type NewPollOption = typeof pollOptions.$inferInsert;

export type PollVote = typeof pollVotes.$inferSelect;
export type NewPollVote = typeof pollVotes.$inferInsert;

export type ThreadLocation = typeof threadLocations.$inferSelect;
export type NewThreadLocation = typeof threadLocations.$inferInsert;

export type ThreadMusic = typeof threadMusic.$inferSelect;
export type NewThreadMusic = typeof threadMusic.$inferInsert;

export type ThreadLike = typeof threadLikes.$inferSelect;
export type NewThreadLike = typeof threadLikes.$inferInsert;

export type ThreadRepost = typeof threadReposts.$inferSelect;
export type NewThreadRepost = typeof threadReposts.$inferInsert;

export type ThreadBookmark = typeof threadBookmarks.$inferSelect;
export type NewThreadBookmark = typeof threadBookmarks.$inferInsert;

export type SearchHistory = typeof searchHistory.$inferSelect;
export type NewSearchHistory = typeof searchHistory.$inferInsert;

export type UserMute = typeof userMutes.$inferSelect;
export type NewUserMute = typeof userMutes.$inferInsert;

export type ThreadReport = typeof threadReports.$inferSelect;
export type NewThreadReport = typeof threadReports.$inferInsert;

export type UserOnboardingTask = typeof userOnboardingTasks.$inferSelect;
export type NewUserOnboardingTask = typeof userOnboardingTasks.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type NewConversationParticipant = typeof conversationParticipants.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
