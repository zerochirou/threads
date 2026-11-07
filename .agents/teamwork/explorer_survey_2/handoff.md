# Handoff Report: UI Components, Forms, Modals, Inputs & State Survey

**State Folder**: `/Users/zerochirou/Developer/Projects/threads/.agents/teamwork/explorer_survey_2`  
**Date**: 2026-11-07T09:20:00Z  
**Investigator**: `explorer_survey_2` (Teamwork Explorer)  
**Parent**: `b7bead26-b456-4ce8-bef6-2683740b0e72`  
**Milestone**: M1_EXPLORATION  

---

## 1. Observation

A systematic inspection of all UI components, modals, dialogs, forms, user inputs, displays, and interactive controls across `src/features/`, `src/components/`, `src/app/`, and `src/db/` revealed the following exact implementations:

### 1.1 Post & Thread Creation Components
* **`PostComposerDialog`** (`src/features/composer/components/post-composer-dialog.tsx:42-367`):
  * **Multi-post Thread State**:
    ```typescript
    export interface ThreadEntry {
      id: string
      content: string
    }
    const [threads, setThreads] = React.useState<ThreadEntry[]>([
      { id: "thread-1", content: "" },
    ])
    ```
    * `addThread`: Appends `{ id: 'thread-${Date.now()}', content: "" }` (lines 85–95).
    * `removeThread`: Deletes post item at index if `threads.length > 1` (lines 97–100).
    * Connecting line rendered between consecutive posts: `<div className="w-[2px] flex-1 min-h-[50px] bg-neutral-800 my-1 rounded-full" />` (line 231).
    * Counter badge displayed: `threads.length > 1 ? '${index + 1}/${threads.length}' : null` (lines 217–218, 255–259).
  * **Target Selector / Community Binding**:
    * First post header features topic/community selector: `<button className="text-neutral-500 hover:text-neutral-300">Community or topic</button>` (lines 246–252).
  * **Toolbar Attachment Actions (10 types)** (lines 114–125):
    1. `RiImageLine`: "Add photo or video" (image/video media upload).
    2. `RiFileGifLine`: "Add GIF" (animated GIF selection).
    3. `RiHeartLine`: "Add reaction" (custom reaction emoji).
    4. `RiEmotionHappyLine`: "Add emoji".
    5. `RiMicLine`: "Voice note" (audio recording).
    6. `RiEqualizerLine`: "Audio clip".
    7. `RiDoubleQuotesL`: "Add quote" (quote repost referencing another thread).
    8. `RiListCheck`: "Add poll" (interactive user polling).
    9. `RiMapPin2Line`: "Add location" (geographic place tag).
    10. `RiMusic2Line`: "Add music" (music track embed).
  * **Draft Management**:
    * Drafts icon button (`RiFileTextLine`, lines 162–174).
    * Dropdown menu with actions: "Save draft" and "Delete draft" (lines 176–208).
  * **Post Audience & Reply Controls**:
    * "Post options" button (`RiArrowUpDownLine`, lines 344–352) for reply permission control.
    * "Post" submit button disabled when `!hasAnyContent`; calls `onPostSuccess(validThreads)` (lines 354–362).
* **`PostComposer`** (`src/features/composer/components/post-composer.tsx:1-64`):
  * Inline trigger box located at top of feeds and profile with author avatar, "What's new?" prompt, and "Post" trigger opening `PostComposerDialog`.

---

### 1.2 Feed Content, Social Actions & Thread Display Components
* **`ThreadCard`** (`src/features/content-scrollbar/components/thread-card.tsx:1-104`):
  * **Author Profile Display**:
    * Username (`post.author.username`, line 41).
    * Verified status (`post.author.verified` renders `<RiVerifiedBadgeFill />`, lines 43–45).
    * Relative timestamp (`post.timeAgo`, line 47).
    * Custom user badges (`post.author.badges`, lines 49–51).
    * Follow badge on avatar (`post.author.hasFollowBadge`, line 32).
  * **Post Header Dropdown Menu** (lines 54–81):
    * "Copy link" (line 72).
    * "Mute author" (line 75) — implies user-level muting relationship.
    * "Report" (`text-destructive`, line 78) — implies content moderation reports.
  * **Post Content & Embeds**:
    * Formatted text with inline links and "Translate" button (`content-scrollbar.tsx:100-103`).
    * Link preview card (`post.linkPreview` rendering `ThreadPreviewCard`, line 90).
* **`ThreadActions`** (`src/features/content-scrollbar/components/thread-actions.tsx:1-79`):
  * **Like Action**: Heart toggle (`RiHeartFill` in `text-rose-500` vs `RiHeartLine`) with `likeCount` (lines 34–49).
  * **Comment Action**: Chat bubble (`RiChat3Line`) with `commentCount` (lines 51–58).
  * **Repost Action**: Repeat icon (`RiRepeatLine`) with `repostCount` (lines 60–67).
  * **Share Action**: Send plane icon (`RiSendPlaneLine`) with `shareCount` (lines 69–76).
* **`ThreadPreviewCard`** (`src/features/content-scrollbar/components/thread-preview-card.tsx:1-102`):
  * Fields: `url`, `domain`, `title`, `headline`, `subheadline`, `tagline`, and preview visual illustration.
* **`FeedHeader`** (`src/features/content-scrollbar/components/feed-header.tsx:1-61`):
  * Feed dropdown menu: "Manage feeds" (line 50), "Hide posts from muted accounts" (line 53).

---

### 1.3 Follow System & Discovery Components
* **`FollowSuggestions` & `FollowItem`** (`src/features/home/components/follow-suggestions.tsx:1-163`, `follow-item.tsx:1-94`):
  * **Data Model (`FollowSuggestion` in `src/features/home/types.ts:7-18`)**:
    * `id`, `username`, `displayName`, `avatarUrl`, `fallback`, `verified`, `bio`, `followersCount`, `mutualFollowers`, `isFollowing`.
  * **Interactive Controls**:
    * Search filter bar (`SearchBar`, line 130).
    * Follow toggle button: "Follow" (outline) <-> "Following" (secondary) (lines 48–60 in `follow-item.tsx`).
    * Stacked mutual follower avatars: `<div className="flex -space-x-1.5 items-center">` (lines 78–88 in `follow-item.tsx`).
* **`SearchView` & `SearchHeader` & `SearchResultItem`** (`src/features/search/components/search-view.tsx`, `search-header.tsx`, `search-result-item.tsx`):
  * **Filter & Search Controls**:
    * Search query input with real-time text matching against username, full name, and bio.
    * Search filter icon button (`RiEqualizer2Line`, line 54 in `search-header.tsx`).
    * Search more options dropdown: "Search settings" and "Clear search history" (lines 90–95 in `search-header.tsx`) — implies persistent search query history.
  * **User Result Card**:
    * Avatar, verified badge (`#0095f6`), username, full name, bio, followers count with icon (`👥`), and follow/unfollow toggle button.

---

### 1.4 Profile Management & Dialogs
* **`ProfileView` & `ProfileBio`** (`src/features/profile/components/profile-view.tsx:1-98`, `profile-bio.tsx:1-119`):
  * User fields: `name`, `username`, `bio`, `avatarUrl`, `followersCount`, `followingCount`, `followerAvatars`.
  * External links: `link: { label: string, url: string, extraCount?: number }` (lines 29–33).
  * Community affiliations: `communities: string[]`, `extraCommunitiesCount: number` (lines 34–35).
  * Follower stats button with mini follower avatars triggering `FollowersDialog` (lines 72–98 in `profile-bio.tsx`).
  * Action buttons: "Edit profile" (opens `EditProfileDialog`) and "View insights" (links to `/insights`).
* **`EditProfileDialog`** (`src/features/profile/components/edit-profile-dialog.tsx:1-281`):
  * Form inputs & interactive switches:
    1. **Name** (`Input`, lines 96–103) + Clickable Avatar for profile picture replacement (lines 106–115).
    2. **Username** (`Input`, lines 126–133).
    3. **Bio** (`Input` / multiline placeholder "+ Write bio", lines 144–151).
    4. **Interests** (`Input`, lines 166–173) — allows adding topics/communities.
    5. **Links** (item showing external count and arrow navigation, lines 179–190).
    6. **Podcast** ("+ Link to your podcast" with external URL, lines 193–206).
    7. **Show Instagram badge** (`Switch`, boolean, lines 209–225).
    8. **Show recent views** (`Switch`, boolean, lines 228–249) — "This will be public on your profile when you get 1K+ recent views."
    9. **Profile privacy** (`Field`, lines 252–265) — Public vs Private toggle ("If you switch to private, only followers can see your threads.").
    10. Submit button ("Done", lines 270–276).
* **`FollowersDialog`** (`src/features/profile/components/followers-dialog.tsx:1-243`):
  * Dual-tab dialog:
    * **"Followers"** tab: displays total follower count and scrollable user list with Follow/Following toggle.
    * **"Following"** tab: displays total following count and scrollable user list with Follow/Following toggle.
* **`ProfileTabsSection`** (`src/features/profile/components/profile-tabs-section.tsx:1-110`):
  * Four distinct content tabs:
    1. **"Threads"**: User threads + `PostComposer` + `FinishProfileCards`.
    2. **"Replies"**: User reply threads.
    3. **"Media"**: User uploaded photos and videos.
    4. **"Reposts"**: Reposted threads.
* **`FinishProfileCards`** (`src/features/profile/components/finish-profile-cards.tsx:1-125`):
  * Setup onboarding checklist carousel: remaining count indicator (`${remainingCount} left`), cards with `title`, `description`, `actionLabel`, `isDone` status toggle.

---

### 1.5 Navigation, Shell & Feeds
* **`Sidebar`** (`src/features/commons/components/sidebar.tsx:1-348`):
  * Logo & wordmark: Links to `/`.
  * Menu dropdown:
    * Theme switcher: Radio items for "Dark", "Light", "Auto" (lines 149–177).
    * Settings link: `/settings` (lines 183–196).
    * Insights link: `/insights` (lines 198–211).
  * Main navigation items:
    * "For you" (`/`)
    * "Search" (`/search`)
    * "Profile" (`/profile`)
    * Commented out: "Messages" (`/messages` with `/assets/icons/messages.svg`).
  * Other feeds navigation:
    * "Following" (`/?feed=following`)
    * "Saved" (`/saved`) — thread bookmarking.
    * "Liked" (`/liked`) — thread likes list.
    * "Show more" / "Show less" toggle.
    * "Edit" feeds button.
  * Communities navigation (documented in lines 65–95):
    * `/communities/anime` ("Anime Threads")
    * `/communities/design` ("Design Threads")
    * `/communities/business` ("Business Threads")
    * `/communities/teacher` ("Teacher Threads")
    * `/communities/tech` ("Tech Threads")
  * CTA Button: "+ New thread" pill opening `PostComposerDialog` (lines 330–344).

---

### 1.6 Authentication Forms & Existing Database Schema
* **Auth Forms** (`src/features/auth/components/signin-form.tsx`, `signup-form.tsx`, `src/components/login-form.tsx`):
  * Email and Password credential input fields with validation and error banners.
  * Name field on sign up.
  * Social OAuth providers: Google and GitHub (`SocialAuthButtons`).
  * Better Auth client integration (`signIn.email`, `signUp.email`, `signIn.social`).
* **Existing Drizzle Schema** (`src/db/schema.ts:1-138`):
  * Core Better Auth tables: `user` (id, name, email, emailVerified, image, createdAt, updatedAt), `session`, `account`, `verification`.
  * Barebones `threads` table: only `id`, `content`, `authorId`, `createdAt`, `updatedAt`.
  * **Discrepancy**: The database lacks tables/columns for:
    * Multi-post thread chains, parent replies, root thread IDs, community bindings, reply controls, quote posts.
    * Media attachments (photos, videos, audio clips, voice notes, GIFs).
    * Polls (questions, options, votes).
    * Locations and music metadata.
    * Likes, reposts, bookmarks/saved posts, reports.
    * User profile extensions (username, bio, verified status, privacy setting, external links, instagram badge toggle, recent views toggle).
    * Follow relationships (followers, following, status).
    * Search query history.
    * Drafts storage.
    * Muted accounts.
    * Communities and community memberships.

---

## 2. Logic Chain

1. **Step 1 — Post Hierarchy & Types**:
   * *Observation*: `PostComposerDialog` allows adding multiple posts to a single thread chain (`ThreadEntry[]`), with an option on post #1 to select a "Community or topic", a "Post options" button for reply privacy, and a toolbar quote button. Furthermore, `ThreadCard` in `content-scrollbar` and `ProfileTabsSection` distinguishes between "Threads", "Replies", and "Reposts".
   * *Inference*: The schema cannot represent posts as isolated rows with only `content` and `authorId`. The `threads` table must support hierarchical relationships (`parent_thread_id` and `root_thread_id` to trace reply trees), sequencing (`order_in_thread`), community association (`community_id`), quote references (`quoted_thread_id`), and reply restrictions (`reply_control`).

2. **Step 2 — Attachments & Interactive Media**:
   * *Observation*: `PostComposerDialog:114-125` defines 10 explicit attachment actions: photos/videos, GIFs, reactions, voice notes, audio clips, quotes, polls, locations, and music. `ThreadPreviewCard` renders domain, URL, title, headline, and image.
   * *Inference*: Dedicated relational tables are necessary:
     - `media_attachments` for images, videos, GIFs, and audio/voice clips (storing URL, mime type, dimensions, duration, sort order).
     - `polls`, `poll_options`, and `poll_votes` for interactive voting.
     - `thread_locations` and `thread_music` (or structured fields) for location and music embeds.
     - `thread_link_previews` for OpenGraph/link preview caching.

3. **Step 3 — Social Engagement & Bookmarking**:
   * *Observation*: `ThreadActions` exposes Like, Comment, Repost, and Share with distinct counters and active states. `Sidebar` routes to `/saved` (Saved threads) and `/liked` (Liked threads). `ThreadCard` dropdown includes "Mute author" and "Report".
   * *Inference*: Dedicated junction tables with composite uniqueness are required:
     - `thread_likes` (`thread_id`, `user_id`).
     - `thread_reposts` (`thread_id`, `user_id`).
     - `thread_bookmarks` (`thread_id`, `user_id`).
     - `thread_reports` (`thread_id`, `reporter_id`, `reason`, `status`).
     - `user_mutes` (`muter_id`, `muted_user_id`).

4. **Step 4 — Follow System & Privacy Model**:
   * *Observation*: `FollowSuggestions`, `FollowItem`, `SearchResultItem`, and `FollowersDialog` all manage Follow/Following status and display follower counts. `EditProfileDialog:252-265` provides a "Profile privacy: Public vs. Private" toggle that explicitly dictates that for private profiles, only approved followers see threads.
   * *Inference*: A `follows` table is required with `follower_id`, `following_id`, and `status` ('pending' | 'accepted') to support both open following and private account approval requests. Compound uniqueness on `(follower_id, following_id)` prevents duplicate follow entries.

5. **Step 5 — Profile Configuration & User Identity**:
   * *Observation*: `EditProfileDialog` manipulates: `name`, `username`, `bio`, `interests`, `links` (multiple), `podcast`, `showInstagramBadge`, `showRecentViews`, and `isPrivate`. `ProfileBio` renders follower counts and stacked avatars.
   * *Inference*:
     - The `user` table must be extended with: `username` (unique text), `bio`, `is_private` (boolean integer), `is_verified` (boolean integer), `show_instagram_badge` (boolean integer), `show_recent_views` (boolean integer), `podcast_url`.
     - An auxiliary `user_links` table is needed to support multiple labeled external links (`user_id`, `label`, `url`, `order_index`).
     - An onboarding table or column is needed to support the `FinishProfileCards` checklist status.

6. **Step 6 — Search History & Drafts**:
   * *Observation*: `SearchHeader` features a dropdown action "Clear search history". `PostComposerDialog` features "Drafts" with "Save draft" and "Delete draft".
   * *Inference*:
     - `search_history` table (`user_id`, `query_text`, `created_at`) enables search history tracking and clearing.
     - `drafts` table (`user_id`, `payload_json`, `created_at`, `updated_at`) persists multi-post draft content.

7. **Step 7 — Communities & Topics**:
   * *Observation*: `Sidebar` explicitly defines communities: Anime, Design, Business, Teacher, Tech Threads (`/communities/[slug]`). `PostComposerDialog` allows selecting community as the thread destination. `ProfileUser` tracks joined communities.
   * *Inference*:
     - `communities` table (`id`, `slug`, `name`, `description`, `icon`, `created_at`).
     - `community_members` junction table (`community_id`, `user_id`, `role`, `joined_at`).

---

## 3. Caveats

1. **Better Auth Compatibility**:
   * The project uses Better Auth (`@better-auth/drizzle-adapter`) configured in `src/lib/auth.ts`. Extending the `user` table with columns (`username`, `bio`, `is_private`, `is_verified`, etc.) must preserve Better Auth's mandatory columns (`id`, `name`, `email`, `email_verified`, `image`, `created_at`, `updated_at`) to avoid breaking authentication.
2. **SQLite / Cloudflare D1 Constraints**:
   * SQLite does not have native enum, date/timestamp, or boolean types. Booleans are stored as `integer({ mode: "boolean" })`, timestamps as `integer({ mode: "timestamp_ms" })`, and enums as `text()`.
   * Foreign key cascading must be explicitly defined (`onDelete: "cascade"`).
3. **Unimplemented Routes**:
   * `/messages`, `/settings`, `/account`, and `/insights` are currently placeholder routes or empty components. While messaging and notifications are clearly represented in the icon assets and design tokens, schema recommendations for messages and notifications are scoped as prospective additions aligned with the UI assets.

---

## 4. Conclusion & Database Schema Requirements Catalog

Below is the definitive catalog of all audited UI features and their required Drizzle ORM SQLite / Cloudflare D1 schema tables, fields, and relationships.

### Catalog Summary Table

| UI Feature / Component | Audited UI Elements | Required Drizzle Table(s) | Key Fields & Constraints |
|---|---|---|---|
| **Thread Creation & Multi-post** | Multi-post chain, community selector, quote, reply privacy | `threads` | `id`, `author_id`, `content`, `parent_thread_id`, `root_thread_id`, `order_in_thread`, `community_id`, `quoted_thread_id`, `reply_control` ('anyone'\|'following'\|'mentioned') |
| **Media & Audio Clips** | Photos, videos, GIFs, voice notes, audio clips | `media_attachments` | `id`, `thread_id`, `url`, `type` ('image'\|'video'\|'audio'\|'gif'), `mime_type`, `width`, `height`, `duration_seconds`, `order_index` |
| **Polls** | Question, options, voting, duration | `polls`, `poll_options`, `poll_votes` | `poll_id`, `thread_id`, `question`, `expires_at`; options `option_text`; votes unique on `(poll_id, user_id)` |
| **Locations & Music** | Map pin tag, music track embed | `thread_locations`, `thread_music` | Location: `name`, `latitude`, `longitude`; Music: `title`, `artist`, `audio_url`, `album_art_url` |
| **Drafts** | Drafts icon, Save draft, Delete draft | `drafts` | `id`, `user_id`, `payload_json`, `created_at`, `updated_at` |
| **Likes** | Like button, liked heart state, liked count, `/liked` | `thread_likes` | `thread_id`, `user_id`, `created_at`, unique `(thread_id, user_id)` |
| **Reposts** | Repost button, repost count, profile Reposts tab | `thread_reposts` | `thread_id`, `user_id`, `created_at`, unique `(thread_id, user_id)` |
| **Bookmarks / Saved** | `/saved` other feed, bookmark action | `thread_bookmarks` | `thread_id`, `user_id`, `created_at`, unique `(thread_id, user_id)` |
| **Link Previews** | Link preview card (domain, headline, image) | `thread_link_previews` | `thread_id`, `url`, `domain`, `title`, `headline`, `image_url` |
| **Moderation & Mutes** | "Mute author", "Hide muted accounts", "Report" | `user_mutes`, `thread_reports` | Mutes: `muter_id`, `muted_user_id`; Reports: `thread_id`, `reporter_id`, `reason`, `status` |
| **Follow System** | Follow suggestions, follow toggle, followers dialog | `follows` | `follower_id`, `following_id`, `status` ('pending'\|'accepted'), unique `(follower_id, following_id)` |
| **User Identity & Bio** | Name, username, bio, avatar, verified, privacy | `user` (extended) | `username` (unique), `bio`, `is_private`, `is_verified`, `show_instagram_badge`, `show_recent_views`, `podcast_url` |
| **Profile Links** | External profile links (`zerochirou.com +1`) | `user_links` | `id`, `user_id`, `label`, `url`, `order_index` |
| **Onboarding Checklist** | Finish profile cards (remaining count, isDone) | `user_onboarding_tasks` | `user_id`, `task_key`, `is_completed`, `completed_at` |
| **Search & Discovery** | Search bar, filters, "Clear search history" | `search_history` | `id`, `user_id`, `query_text`, `created_at` |
| **Communities** | Sidebar communities (`/communities/[slug]`) | `communities`, `community_members` | `communities`: `slug`, `name`, `description`, `icon`; `community_members`: `community_id`, `user_id`, `role` |
| **Notifications** | Notification icon & badge dot in DESIGN.md | `notifications` | `recipient_id`, `actor_id`, `type`, `thread_id`, `is_read`, `created_at` |

---

## 5. Verification Method

To independently reproduce and verify the findings in this report:

1. **Verify UI Components & Implementations**:
   * Inspect multi-post thread logic:
     `view_file src/features/composer/components/post-composer-dialog.tsx` (lines 42–125)
   * Inspect thread actions (Like, Comment, Repost, Share):
     `view_file src/features/content-scrollbar/components/thread-actions.tsx`
   * Inspect profile edit dialog inputs & toggles:
     `view_file src/features/profile/components/edit-profile-dialog.tsx` (lines 83–277)
   * Inspect followers/following tabs and user row:
     `view_file src/features/profile/components/followers-dialog.tsx` (lines 173–242)
   * Inspect search controls and history clearing:
     `view_file src/features/search/components/search-header.tsx` (lines 40–97)
   * Inspect sidebar feeds and community links:
     `view_file src/features/commons/components/sidebar.tsx` (lines 50–95, 273–326)

2. **Verify Database Discrepancy**:
   * Compare existing schema against requirements:
     `view_file src/db/schema.ts`
   * Run type check command to ensure current TypeScript baseline:
     `pnpm tsc --noEmit`

3. **Invalidation Conditions**:
   * If any listed component or interactive control does not exist in `src/`, this report is invalidated.
   * If any input field cited in this report is missing from the respective component's JSX, this report is invalidated.
