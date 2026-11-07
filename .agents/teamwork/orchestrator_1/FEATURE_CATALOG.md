# UI Feature Catalog & Database Requirements Mapping

This catalog documents all user-facing features identified from the UI audit of `src/app/`, `src/features/`, and `src/components/`, along with the corresponding database entities, attributes, relationships, and constraints for SQLite / Cloudflare D1.

---

### 1. Authentication & Core User Profile
* **UI Features**:
  - Sign in with email/password (`src/components/login-form.tsx`, `signin-form.tsx`).
  - Sign up with name, email, password (`signup-form.tsx`).
  - Social OAuth login with Google and GitHub (`social-auth-buttons.tsx`).
  - Session management and cookie tokens (`src/lib/auth.ts`, `src/app/api/auth/[...all]/route.ts`).
  - Profile header display: Name, username handle, avatar, verified badge (`RiVerifiedBadgeFill`), follow badge (`+` overlay), bio text, follower counts, following counts (`src/features/profile/components/profile-bio.tsx`).
  - Profile editing modal (`src/features/profile/components/edit-profile-dialog.tsx`):
    - Name (editable string)
    - Username handle (editable string, unique)
    - Bio (editable multi-line text)
    - Avatar picture URL
    - Interests (text / tags)
    - Multiple external links (`Links: 2`)
    - Podcast link (`+ Link to your podcast`)
    - Toggle: Show Instagram badge (boolean)
    - Toggle: Show recent views (boolean)
    - Privacy: Profile privacy Public vs Private (boolean / enum)
* **Database Mapping**:
  - `user` table:
    - `id`: `text("id").primaryKey()`
    - `name`: `text("name").notNull()`
    - `email`: `text("email").notNull().unique()`
    - `emailVerified`: `integer("email_verified", { mode: "boolean" }).notNull()`
    - `image`: `text("image")`
    - `username`: `text("username").unique()`
    - `bio`: `text("bio")`
    - `verified`: `integer("verified", { mode: "boolean" }).default(false).notNull()`
    - `hasFollowBadge`: `integer("has_follow_badge", { mode: "boolean" }).default(false).notNull()`
    - `isPrivate`: `integer("is_private", { mode: "boolean" }).default(false).notNull()`
    - `showInstagramBadge`: `integer("show_instagram_badge", { mode: "boolean" }).default(false).notNull()`
    - `showRecentViews`: `integer("show_recent_views", { mode: "boolean" }).default(false).notNull()`
    - `podcastUrl`: `text("podcast_url")`
    - `interests`: `text("interests")`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
    - `updatedAt`: `integer("updated_at", { mode: "timestamp_ms" })`
  - `session`, `account`, `verification` tables: standard Better Auth definitions.
  - `user_links` table:
    - `id`: `text("id").primaryKey()`
    - `userId`: `text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `label`: `text("label").notNull()`
    - `url`: `text("url").notNull()`
    - `orderIndex`: `integer("order_index").default(0).notNull()`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`

---

### 2. Social Graph (Follows & Relationships)
* **UI Features**:
  - Follow / Following toggle buttons (`src/features/home/components/follow-item.tsx`, `followers-dialog.tsx`, `search-result-item.tsx`).
  - Followers & Following dialog with dual tabs and user lists (`src/features/profile/components/followers-dialog.tsx`).
  - Follow suggestions with mutual followers avatar stack (`src/features/home/components/follow-suggestions.tsx`).
  - Following feed (`/?feed=following`).
  - Follow request approval workflow for private accounts (`isPrivate`).
* **Database Mapping**:
  - `follows` table:
    - `id`: `text("id").primaryKey()`
    - `followerId`: `text("follower_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `followingId`: `text("following_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `status`: `text("status").default("accepted").notNull()` ('pending' | 'accepted')
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
    - Unique index on `(follower_id, following_id)`.

---

### 3. Thread Publishing, Multi-post Chains, Replies & Drafts
* **UI Features**:
  - Multi-post thread chaining in composer: sequentially append connected thread entries (`ThreadEntry[]`), visual connecting line, item counter `${index + 1}/${threads.length}` (`src/features/composer/components/post-composer-dialog.tsx:85-100`).
  - Topic / Community tag selection on first thread entry (`post-composer-dialog.tsx:246-252`).
  - Post reply privacy options ("Anyone can reply", "Profiles you follow", "Mentioned only") (`post-composer-dialog.tsx:344-352`).
  - Draft management: "Save draft" and "Delete draft" menu items (`post-composer-dialog.tsx:176-208`).
  - Nested replies and comments (`src/features/content-scrollbar/components/thread-actions.tsx:51-58`).
  - Profile tabs: Threads tab vs Replies tab (`src/features/profile/components/profile-tabs-section.tsx`).
* **Database Mapping**:
  - `threads` table:
    - `id`: `text("id").primaryKey()`
    - `authorId`: `text("author_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `content`: `text("content").notNull()`
    - `parentThreadId`: `text("parent_thread_id").references((): AnySQLiteColumn => threads.id, { onDelete: "cascade" })`
    - `rootThreadId`: `text("root_thread_id").references((): AnySQLiteColumn => threads.id, { onDelete: "cascade" })`
    - `threadOrder`: `integer("thread_order").default(0).notNull()`
    - `replyPrivacy`: `text("reply_privacy").default("anyone").notNull()` ('anyone' | 'following' | 'mentioned')
    - `isDraft`: `integer("is_draft", { mode: "boolean" }).default(false).notNull()`
    - `communityId`: `text("community_id").references(() => communities.id, { onDelete: "set null" })`
    - `likeCount`: `integer("like_count").default(0).notNull()`
    - `replyCount`: `integer("reply_count").default(0).notNull()`
    - `repostCount`: `integer("repost_count").default(0).notNull()`
    - `shareCount`: `integer("share_count").default(0).notNull()`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
    - `updatedAt`: `integer("updated_at", { mode: "timestamp_ms" })`

---

### 4. Rich Media, Audio Clips, Polls, Locations & Music Attachments
* **UI Features**:
  - 10 composer attachment toolbar buttons (`PostComposerDialog.tsx:114-125`):
    1. Photo or video
    2. GIF
    3. Reaction
    4. Emoji
    5. Voice note
    6. Audio clip
    7. Quote
    8. Poll (`RiListCheck`)
    9. Location (`RiMapPin2Line`)
    10. Music (`RiMusic2Line`)
  - Rich link preview card (`ThreadPreviewCard.tsx:1-102`): URL, domain, title, headline, subheadline, tagline, image preview.
  - Profile Media tab: photos and videos uploaded by user.
* **Database Mapping**:
  - `thread_media` table:
    - `id`: `text("id").primaryKey()`
    - `threadId`: `text("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" })`
    - `type`: `text("type").notNull()` ('image' | 'video' | 'gif' | 'audio' | 'voice_note')
    - `url`: `text("url").notNull()`
    - `mimeType`: `text("mime_type")`
    - `width`: `integer("width")`
    - `height`: `integer("height")`
    - `durationSeconds`: `integer("duration_seconds")`
    - `orderIndex`: `integer("order_index").default(0).notNull()`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
  - `thread_link_previews` table:
    - `id`: `text("id").primaryKey()`
    - `threadId`: `text("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" })`
    - `url`: `text("url").notNull()`
    - `domain`: `text("domain").notNull()`
    - `title`: `text("title")`
    - `headline`: `text("headline")`
    - `subheadline`: `text("subheadline")`
    - `tagline`: `text("tagline")`
    - `imageUrl`: `text("image_url")`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
  - `polls` table:
    - `id`: `text("id").primaryKey()`
    - `threadId`: `text("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" })`
    - `question`: `text("question").notNull()`
    - `expiresAt`: `integer("expires_at", { mode: "timestamp_ms" })`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
  - `poll_options` table:
    - `id`: `text("id").primaryKey()`
    - `pollId`: `text("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" })`
    - `optionText`: `text("option_text").notNull()`
    - `orderIndex`: `integer("order_index").default(0).notNull()`
  - `poll_votes` table:
    - `id`: `text("id").primaryKey()`
    - `pollOptionId`: `text("poll_option_id").notNull().references(() => poll_options.id, { onDelete: "cascade" })`
    - `pollId`: `text("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" })`
    - `userId`: `text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
    - Unique index on `(poll_id, user_id)` (one vote per user per poll).
  - `thread_locations` table:
    - `id`: `text("id").primaryKey()`
    - `threadId`: `text("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" })`
    - `name`: `text("name").notNull()`
    - `latitude`: `text("latitude")`
    - `longitude`: `text("longitude")`
  - `thread_music` table:
    - `id`: `text("id").primaryKey()`
    - `threadId`: `text("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" })`
    - `title`: `text("title").notNull()`
    - `artist`: `text("artist").notNull()`
    - `audioUrl`: `text("audio_url")`
    - `albumArtUrl`: `text("album_art_url")`

---

### 5. Social Interactions (Likes, Reposts, Bookmarks/Saved)
* **UI Features**:
  - Heart Like / Unlike button with interactive counter toggle (`ThreadActions.tsx:34-49`).
  - Liked threads feed (`/liked` in `Sidebar.tsx:306`).
  - Repost / Quote button with counter (`ThreadActions.tsx:60-67`).
  - Profile Reposts tab (`ProfileTabsSection.tsx:51-56`).
  - Bookmark / Save button; Saved threads feed (`/saved` in `Sidebar.tsx:296`).
  - Share link button (`ThreadActions.tsx:69-76`).
* **Database Mapping**:
  - `thread_likes` table:
    - `id`: `text("id").primaryKey()`
    - `userId`: `text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `threadId`: `text("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" })`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
    - Unique index on `(user_id, thread_id)`.
  - `thread_reposts` table:
    - `id`: `text("id").primaryKey()`
    - `userId`: `text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `threadId`: `text("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" })`
    - `quoteContent`: `text("quote_content")`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
    - Unique index on `(user_id, thread_id)`.
  - `thread_bookmarks` table:
    - `id`: `text("id").primaryKey()`
    - `userId`: `text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `threadId`: `text("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" })`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
    - Unique index on `(user_id, thread_id)`.

---

### 6. Communities & Memberships
* **UI Features**:
  - Sidebar communities (`/communities/anime`, `/communities/design`, `/communities/business`, `/communities/teacher`, `/communities/tech`).
  - Community selector in thread composer (`PostComposerDialog.tsx:246`).
  - User community affiliations in profile bio (`ProfileUser.communities`).
* **Database Mapping**:
  - `communities` table:
    - `id`: `text("id").primaryKey()`
    - `slug`: `text("slug").notNull().unique()`
    - `name`: `text("name").notNull()`
    - `description`: `text("description")`
    - `icon`: `text("icon")`
    - `bannerUrl`: `text("banner_url")`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
  - `community_members` table:
    - `id`: `text("id").primaryKey()`
    - `communityId`: `text("community_id").notNull().references(() => communities.id, { onDelete: "cascade" })`
    - `userId`: `text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `role`: `text("role").default("member").notNull()` ('member' | 'moderator' | 'admin')
    - `joinedAt`: `integer("joined_at", { mode: "timestamp_ms" })`
    - Unique index on `(community_id, user_id)`.

---

### 7. Search History, Moderation & Onboarding
* **UI Features**:
  - Search input, real-time filtering, "Clear search history" (`SearchHeader.tsx:90-95`).
  - "Mute author", "Hide posts from muted accounts" (`ThreadCard.tsx:75`, `FeedHeader.tsx:53`).
  - "Report" thread (`ThreadCard.tsx:78`).
  - Finish profile setup cards: checklist tasks, remaining count, completion status (`FinishProfileCards.tsx:1-125`).
  - Notification alert icons and badge dot (`public/assets/icons/notifications.svg`, `Sidebar.tsx:241`).
  - Direct message conversations (`src/app/(home)/messages/`, `/assets/icons/messages.svg`).
* **Database Mapping**:
  - `search_history` table:
    - `id`: `text("id").primaryKey()`
    - `userId`: `text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `query`: `text("query").notNull()`
    - `targetUserId`: `text("target_user_id").references(() => user.id, { onDelete: "set null" })`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
  - `user_mutes` table:
    - `id`: `text("id").primaryKey()`
    - `muterId`: `text("muter_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `mutedUserId`: `text("muted_user_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
    - Unique index on `(muter_id, muted_user_id)`.
  - `thread_reports` table:
    - `id`: `text("id").primaryKey()`
    - `reporterId`: `text("reporter_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `threadId`: `text("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" })`
    - `reason`: `text("reason").notNull()`
    - `status`: `text("status").default("pending").notNull()`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
  - `user_onboarding_tasks` table:
    - `id`: `text("id").primaryKey()`
    - `userId`: `text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `taskKey`: `text("task_key").notNull()`
    - `isCompleted`: `integer("is_completed", { mode: "boolean" }).default(false).notNull()`
    - `completedAt`: `integer("completed_at", { mode: "timestamp_ms" })`
    - Unique index on `(user_id, task_key)`.
  - `notifications` table:
    - `id`: `text("id").primaryKey()`
    - `recipientId`: `text("recipient_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `actorId`: `text("actor_id").notNull().references(() => user.id, { onDelete: "cascade" })`
    - `type`: `text("type").notNull()` ('like' | 'reply' | 'repost' | 'follow' | 'mention')
    - `threadId`: `text("thread_id").references(() => threads.id, { onDelete: "cascade" })`
    - `isRead`: `integer("is_read", { mode: "boolean" }).default(false).notNull()`
    - `createdAt`: `integer("created_at", { mode: "timestamp_ms" })`
  - `conversations`, `conversation_participants`, `messages` tables:
    - For direct messaging capabilities (`/messages`).
