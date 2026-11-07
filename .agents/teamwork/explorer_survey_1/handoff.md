# UI Feature, Route, Layout, and User Flow Audit

**State Folder**: `/Users/zerochirou/Developer/Projects/threads/.agents/teamwork/explorer_survey_1/`  
**Date**: 2026-11-07  
**Archetype**: explorer  
**Task**: Comprehensive audit of all UI pages, routes, layouts, navigation, and user journeys across the codebase to inform the Drizzle ORM schema for SQLite / Cloudflare D1.

---

## 1. Observation

A systematic survey of the repository (`/Users/zerochirou/Developer/Projects/threads`) identified all Next.js App Router routes, layouts, navigation structures, feature components, and user flows.

### 1.1 Route & Layout Inventory

The application is structured using Next.js 16 App Router under `src/app/`.

| Route Path | File Location | Purpose & Rendered UI | Status |
| :--- | :--- | :--- | :--- |
| **Root Layout** | `src/app/layout.tsx` | Wraps all routes with fonts (Geist, Geist Mono, Inter), `ThemeProvider` (defaulting to dark mode), and `TooltipProvider`. | Active |
| `/` | `src/app/(home)/page.tsx` | Main 3-column feed: `Sidebar` (left), `ContentScrollbar` (center, 668px), `FollowSuggestions` (right rail, hidden &lt; xl). | Active |
| `/search` | `src/app/(home)/search/page.tsx` | Search & Discovery page: `Sidebar` (left), `SearchView` (center, 668px), empty balancer column (right). | Active |
| `/profile` | `src/app/(home)/profile/page.tsx` | Current user profile: `Sidebar` (left), `ProfileView` (center, 668px), `FollowSuggestions` (right rail). | Active |
| `/messages` | `src/app/(home)/messages/page.tsx` | Direct messaging page. Returns `<div></div>`. Feature directory `src/features/messages/` exists. | Stub |
| `/settings` | `src/app/(protected)/settings/page.tsx` | Settings configuration page. Returns `<div></div>`. Feature directory `src/features/settings/` exists. | Stub |
| `/account` | `src/app/(protected)/account/page.tsx` | Account management page. Returns `<div></div>`. Feature directory `src/features/account/` exists. | Stub |
| `/signin` | `src/app/(auth)/signin/page.tsx` | Authentication sign-in page rendering `LoginForm` (`src/components/login-form.tsx`). | Active |
| `/signup` | `src/app/(auth)/signup/page.tsx` | User registration page rendering `SignUpForm` (`src/features/auth/components/signup-form.tsx`). | Active |
| `/login` | `src/app/login/page.tsx` | Centered full-screen login page rendering `LoginForm`. | Active |
| `/api/auth/[...all]` | `src/app/api/auth/[...all]/route.ts` | Better-Auth API route handlers (`GET`, `POST`) connected to D1 database adapter. | Active |
| `/api/health` | `src/app/api/health/route.ts` | Health check endpoint querying `user` table count from D1. | Active |

#### Additional Navigation Targets Referenced in UI

Multiple components reference specific navigation endpoints, feeds, and filters:
1. `/?feed=following`: Linked in `Sidebar.tsx:289` ("Following" feed).
2. `/saved`: Linked in `Sidebar.tsx:296` ("Saved" bookmarks feed).
3. `/liked`: Linked in `Sidebar.tsx:306` ("Liked" posts feed).
4. `/insights`: Linked in `Sidebar.tsx:201` ("Insights" menu item) and triggered via `ProfileBio.tsx:111` ("View insights" button).
5. `/communities/:slug`: Referenced in `Sidebar.tsx:65-95` (`/communities/anime`, `/communities/design`, `/communities/business`, `/communities/teacher`, `/communities/tech`) and in `PostComposerDialog.tsx:250` (`> Community or topic` selector).
6. `/terms`, `/privacy`, `/cookies`: Linked in `HomeFooter.tsx:23-34`.
7. `/assets/icons/notifications.svg`: Present in `public/assets/icons/notifications.svg` and referenced in `Sidebar.tsx:241` for notification styling.

---

### 1.2 Component & Feature Breakdown

#### A. Left Rail Navigation (`Sidebar`)
- **File**: `src/features/commons/components/sidebar.tsx` (lines 1–348)
- **Observed UI elements & actions**:
  - Wordmark link (`threads`, links to `/`).
  - Top "More options" dropdown (`RiEqualLine`, lines 118–214):
    - Appearance switcher: Radio group with "Dark", "Light", "Auto" (`next-themes`).
    - Settings item: Links to `/settings` (`RiSettings3Line`).
    - Insights item: Links to `/insights` (`RiBarChartBoxLine`).
  - Main Navigation items (lines 50–63, 218–251):
    - "For you" (`/`, icon: `/assets/icons/home.svg`).
    - "Search" (`/search`, icon: `/assets/icons/search.svg`).
    - "Profile" (`/profile`, icon: `/assets/icons/profile.svg`).
    - *(Commented out in lines 53-57)*: "Messages" (`/messages`, icon: `/assets/icons/messages.svg`).
  - "Other feeds" Section (lines 273–326):
    - "Following" (`/?feed=following`).
    - "Saved" (`/saved`, `RiBookmarkLine`).
    - "Liked" (`/liked`, `RiHeartLine`).
    - "Show more / Show less" toggle.
    - "Edit" feeds button.
  - "New thread" Action Button (lines 330–345):
    - Floating black pill button opening `PostComposerDialog`.

#### B. Home Feed & Post Display (`ContentScrollbar`, `ThreadCard`)
- **Files**:
  - `src/features/content-scrollbar/components/content-scrollbar.tsx` (lines 1–169)
  - `src/features/content-scrollbar/components/feed-header.tsx` (lines 1–61)
  - `src/features/content-scrollbar/components/thread-card.tsx` (lines 1–104)
  - `src/features/content-scrollbar/components/thread-actions.tsx` (lines 1–79)
  - `src/features/content-scrollbar/components/thread-preview-card.tsx` (lines 1–102)
  - `src/features/content-scrollbar/components/thread-avatar.tsx` (lines 1–43)
  - `src/features/content-scrollbar/types.ts` (lines 1–32)
- **Observed UI elements & data fields**:
  - `FeedHeader`:
    - Title display ("For you" or custom feed title).
    - Dropdown menu ("Manage feeds", "Hide posts from muted accounts").
  - Inline `PostComposer` at the top of the feed container.
  - `ThreadCard`:
    - **Author data**: Avatar (`avatarUrl`, fallback initials), `username`, `verified` badge (`RiVerifiedBadgeFill`), `hasFollowBadge` (`+` overlay badge on avatar), custom badges (e.g., author pencil `✏️`, red heart `❤️`).
    - **Post metadata**: `timeAgo` relative timestamp string, post body content (rich text, paragraphs, inline links).
    - **Post actions dropdown** (`RiMoreLine`): "Copy link", "Mute author", "Report".
    - **Embedded Rich Link Preview** (`ThreadPreviewCard`):
      - Preview graphic header with visual styling.
      - `url`, `domain` (e.g. `style.ai.id`), `title`, `headline`, `subheadline`, `tagline`.
    - **Interactive Action Bar** (`ThreadActions`):
      - Like button: Toggles heart (`RiHeartLine` &harr; `RiHeartFill`), like count counter, active rose color state.
      - Comment / Reply button (`RiChat3Line`) with `commentCount`.
      - Repost button (`RiRepeatLine`) with `repostCount`.
      - Share button (`RiSendPlaneLine`) with `shareCount`.

#### C. Post & Thread Composer (`PostComposer`, `PostComposerDialog`)
- **Files**:
  - `src/features/composer/components/post-composer.tsx` (lines 1–64)
  - `src/features/composer/components/post-composer-dialog.tsx` (lines 1–367)
- **Observed UI elements & data fields**:
  - Inline trigger banner on home feed & profile: User avatar, "What's new?" placeholder button, "Post" CTA button.
  - Full modal dialog (`PostComposerDialog`):
    - Multi-post thread chaining:
      - State: `threads: ThreadEntry[]` (each item has `id` and `content`).
      - Chained thread visual layout: Avatars connected by vertical guideline.
      - Thread item counter: Shows `${index + 1}/${threads.length}` when multiple posts exist.
      - "Add to thread" button: Appends a new connected thread item in the sequence.
      - Remove thread button (`RiCloseLine`): Deletes chained item (for index > 0).
    - Community / Topic selector: First thread item has `> Community or topic` target picker.
    - Drafts & Options:
      - Drafts button (`RiFileTextLine`).
      - More dropdown: "Save draft", "Delete draft".
      - "Post options" footer button (`RiArrowUpDownLine`).
    - Attachment Toolbar Icons (lines 114–125):
      - `RiImageLine`: "Add photo or video"
      - `RiFileGifLine`: "Add GIF"
      - `RiHeartLine`: "Add reaction"
      - `RiEmotionHappyLine`: "Add emoji"
      - `RiMicLine`: "Voice note"
      - `RiEqualizerLine`: "Audio clip"
      - `RiDoubleQuotesL`: "Add quote"
      - `RiListCheck`: "Add poll"
      - `RiMapPin2Line`: "Add location"
      - `RiMusic2Line`: "Add music"
    - "Post" button: Disabled when content is empty, calls `onPostSuccess(threads)`.

#### D. Right Rail Follow Suggestions (`FollowSuggestions`)
- **Files**:
  - `src/features/home/components/follow-suggestions.tsx` (lines 1–163)
  - `src/features/home/components/follow-item.tsx` (lines 1–94)
  - `src/features/home/components/search-bar.tsx` (lines 1–33)
  - `src/features/home/components/home-footer.tsx` (lines 1–37)
  - `src/features/home/types.ts` (lines 1–18)
- **Observed UI elements & data fields**:
  - Search input: Real-time filtering by `username`, `displayName`, and `bio`.
  - Follow suggestion card (`FollowItem`):
    - `avatarUrl`, `fallback` initials.
    - `username`, verified badge (`RiVerifiedBadgeFill`).
    - `displayName` (subtitle).
    - `bio` text (clamped to 2 lines).
    - `followersCount` string (e.g., "43.1K followers").
    - `mutualFollowers`: Array of avatar objects (`avatarUrl`, `alt`, `fallback`).
    - Follow / Following toggle button: Switches state between "Follow" and "Following".
  - `HomeFooter`: Copyright year, links to `/terms`, `/privacy`, `/cookies`.

#### E. Search & Discovery View (`SearchView`)
- **Files**:
  - `src/features/search/components/search-view.tsx` (lines 1–151)
  - `src/features/search/components/search-header.tsx` (lines 1–100)
  - `src/features/search/components/search-result-item.tsx` (lines 1–101)
  - `src/features/search/types.ts` (lines 1–11)
- **Observed UI elements & data fields**:
  - `SearchHeader`:
    - Full search input with live search icon.
    - Search filter toggle button (`RiEqualizer2Line`).
    - More options dropdown: "Search settings", "Clear search history".
  - Search container header: Changes title dynamically:
    - If `searchQuery` is empty: "Follow suggestions".
    - If `searchQuery` is present: "Search results".
  - `SearchResultItem`:
    - `avatarUrl`, `fallback`.
    - `username`, `fullName`, verified badge.
    - `bio` full description.
    - `followersCountText` with group icon (`👥 468K followers`).
    - Follow / Following toggle button.

#### F. Profile System (`ProfileView`)
- **Files**:
  - `src/features/profile/components/profile-view.tsx` (lines 1–98)
  - `src/features/profile/components/profile-header-nav.tsx` (lines 1–79)
  - `src/features/profile/components/profile-bio.tsx` (lines 1–119)
  - `src/features/profile/components/profile-tabs-section.tsx` (lines 1–110)
  - `src/features/profile/components/edit-profile-dialog.tsx` (lines 1–281)
  - `src/features/profile/components/followers-dialog.tsx` (lines 1–243)
  - `src/features/profile/components/finish-profile-cards.tsx` (lines 1–125)
  - `src/features/profile/types.ts` (lines 1–33)
- **Observed UI elements & data fields**:
  1. `ProfileHeaderNav`:
     - Displays `username`.
     - More options dropdown: "Copy link", "About this profile".
  2. `ProfileBio`:
     - `name` (bold title), `username`.
     - Large avatar image (size 80-88px).
     - `bio` text (whitespace preserved).
     - External link: `user.link.url`, `user.link.label` (e.g. `zerochirou.com`).
     - Follower stats row: Stacked mini-avatars + `${followersCount} followers` counter. Clicking triggers `FollowersDialog`.
     - Two action buttons: "Edit profile" (triggers `EditProfileDialog`) and "View insights" (calls `onViewInsights`).
  3. `EditProfileDialog`:
     - **Name**: Editable text input + clickable avatar changer.
     - **Username**: Editable text input.
     - **Bio**: Editable text input / textarea.
     - **Interests**: Input for community topics (e.g., "AnimeThreads, DesignThreads, BusinessThreads").
     - **Links**: Link list navigation with count badge.
     - **Podcast**: Navigation row ("+ Link to your podcast").
     - **Show Instagram badge**: Boolean `Switch` toggle.
     - **Show recent views**: Boolean `Switch` toggle ("This will be public on your profile when you get 1K+ recent views").
     - **Profile privacy**: Selector between "Public" and "Private" ("If you switch to private, only followers can see your threads...").
     - Form submit button: "Done".
  4. `FollowersDialog`:
     - Tabbed modal dialog:
       - Tab 1: "Followers" with count badge.
       - Tab 2: "Following" with count badge.
     - Scrollable user list:
       - User avatar, `username`, `fullName`.
       - Follow / Following toggle button (with red hover state on unfollow).
  5. `FinishProfileCards`:
     - Onboarding / profile completion carousel:
       - Title: "Finish your profile" with counter "1 left".
       - Horizontal scrollable card list with floating next arrow button.
       - Checklist cards: `title` ("Create thread"), `description`, `actionLabel` ("Create" &rarr; "Done"), `isDone` boolean status.
  6. `ProfileTabsSection`:
     - Four tab triggers:
       - `Threads`: Shows inline `PostComposer`, `FinishProfileCards`, and user's `ThreadCard` posts.
       - `Replies`: Displays empty state ("No replies yet").
       - `Media`: Displays empty state ("No media yet").
       - `Reposts`: Displays empty state ("No reposts yet").

#### G. Authentication System (`src/features/auth/`, `src/components/login-form.tsx`)
- **Files**:
  - `src/components/login-form.tsx` (lines 1–159)
  - `src/features/auth/components/signin-form.tsx` (lines 1–110)
  - `src/features/auth/components/signup-form.tsx` (lines 1–127)
  - `src/features/auth/components/social-auth-buttons.tsx` (lines 1–48)
  - `src/lib/auth.ts` (lines 1–79)
  - `src/lib/auth-client.ts`
- **Observed UI elements & data fields**:
  - Sign in: Email, password, "Login" button (`signIn.email`).
  - Social login: "Continue with Google" (`signIn.social({ provider: "google" })`), "Continue with GitHub" (`signIn.social({ provider: "github" })`).
  - Sign up: Name, email, password, "Sign Up" button (`signUp.email`).
  - Session and cookies integration with Better-Auth.

---

### 1.3 Audit of Existing Database Schema

Inspection of `src/db/schema.ts` (lines 1–138) and `drizzle/0000_absurd_grim_reaper.sql` reveals the baseline database setup:

```typescript
// Currently present in src/db/schema.ts:
// 1. user: id, name, email, emailVerified, image, createdAt, updatedAt
// 2. session: id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId
// 3. account: id, accountId, providerId, userId, accessToken, refreshToken, idToken, accessTokenExpiresAt, refreshTokenExpiresAt, scope, password, createdAt, updatedAt
// 4. verification: id, identifier, value, expiresAt, createdAt, updatedAt
// 5. threads: id, content, authorId, createdAt, updatedAt
```

#### Schema Gaps Identified:
The existing `threads` table and `user` table lack virtually all the fields, relations, and supporting tables required by the UI features documented above:
- **User gaps**: Missing `username` (unique handle), `bio`, `verified`, `hasFollowBadge`, `isPrivate`, `showInstagramBadge`, `showRecentViews`, and external links.
- **Thread/Post gaps**: Missing multi-post thread sequencing (`parentPostId`, `rootPostId`, `orderInThread`), reply targeting (`replyToUserId`), draft status (`isDraft`), topic/community classification, and metrics/denormalized counts.
- **Missing Relationship Tables**:
  - `follows` (following / followers relationship).
  - `likes` (user thread likes).
  - `reposts` (user reposts).
  - `saved_posts` / `bookmarks` (saved threads).
  - `thread_attachments` / `media` (images, videos, audio, gifs).
  - `link_previews` (preview card data: domain, title, headline, subheadline, tagline).
  - `polls`, `poll_options`, `poll_votes` (interactive polls from composer).
  - `communities`, `community_members` (anime, design, tech, etc.).
  - `user_mutes`, `user_blocks`, `reports` (moderation and mute controls).
  - `search_history` (search tracking & history clearing).
  - `user_profile_setup` (onboarding task completion).

---

## 2. Logic Chain

The relationship between observed UI elements and the required database schema is directly traceable through the following steps:

### Step 2.1: User Profile & Authentication Logic
- **Observation**: `ProfileBio.tsx:30-46` displays `name`, `username`, `bio`, `avatarUrl`, external link `url`/`label`, and `followersCount`. `EditProfileDialog.tsx:84-266` provides editing for `name`, `username`, `bio`, `interests`, `showInstagramBadge`, `showRecentViews`, and `profilePrivacy` ("Public" vs "Private").
- **Deduction**: The `user` table must be expanded beyond basic Better-Auth fields (`id`, `name`, `email`, `image`) to include:
  - `username`: `text("username").notNull().unique()`
  - `bio`: `text("bio")`
  - `verified`: `integer("verified", { mode: "boolean" }).default(false).notNull()`
  - `hasFollowBadge`: `integer("has_follow_badge", { mode: "boolean" }).default(false).notNull()`
  - `isPrivate`: `integer("is_private", { mode: "boolean" }).default(false).notNull()`
  - `showInstagramBadge`: `integer("show_instagram_badge", { mode: "boolean" }).default(false).notNull()`
  - `showRecentViews`: `integer("show_recent_views", { mode: "boolean" }).default(false).notNull()`
  - `podcastUrl`: `text("podcast_url")`
  - Separate `user_links` table (or structured fields) to support multiple external links (`url`, `label`, `order`).

### Step 2.2: Social Graph / Follow System Logic
- **Observation**: Follow actions appear in `FollowItem.tsx:48-60`, `SearchResultItem.tsx:67-79`, and `FollowersDialog.tsx:156-169`. The dialog tabs separate "Followers" from "Following" with accurate counters.
- **Deduction**: A dedicated `follows` table is required:
  - `followerId` referencing `user.id`
  - `followingId` referencing `user.id`
  - `createdAt` timestamp
  - Composite primary key on `(followerId, followingId)` and foreign key cascades on delete.

### Step 2.3: Posts, Chained Multi-Post Threads, & Replies Logic
- **Observation**:
  - `PostComposerDialog.tsx:64-100` allows users to compose a series of connected posts (`threads.map(...)`) that post together.
  - `ThreadActions.tsx:51-58` provides a comment/reply button with `commentCount`.
  - `ProfileTabsSection.tsx:40-44, 85-90` provides a "Replies" tab.
  - `PostComposerDialog.tsx:201-206` includes "Save draft" and "Delete draft".
- **Deduction**: The `threads` table must support root posts, replies, and chained multi-post threads:
  - `id`: primary key.
  - `authorId`: references `user.id`.
  - `content`: text body.
  - `parentPostId`: self-referencing foreign key to `threads.id` (nullable).
  - `rootPostId`: self-referencing foreign key to `threads.id` (nullable).
  - `replyToUserId`: references `user.id` (nullable).
  - `orderInThread`: integer for ordering parts of a single thread broadcast (1, 2, 3...).
  - `isDraft`: boolean flag indicating whether the item is a draft.
  - `communityId`: references `communities.id` (nullable).
  - `createdAt`, `updatedAt` timestamps.

### Step 2.4: Post Interactions (Likes, Reposts, Bookmarks/Saved) Logic
- **Observation**:
  - `ThreadActions.tsx:33-78` implements toggle like (`RiHeartFill`/`RiHeartLine`, `likeCount`), repost (`RiRepeatLine`, `repostCount`), and share (`RiSendPlaneLine`, `shareCount`).
  - `Sidebar.tsx:296-313` links to `/saved` (`RiBookmarkLine`) and `/liked` (`RiHeartLine`).
  - `ProfileTabsSection.tsx:51-56, 101-106` provides a "Reposts" tab.
- **Deduction**:
  - `likes` table: `id`, `userId`, `threadId`, `createdAt`, with a unique index on `(userId, threadId)`.
  - `reposts` table: `id`, `userId`, `threadId`, `createdAt`, with a unique index on `(userId, threadId)`.
  - `saved_posts` / `bookmarks` table: `id`, `userId`, `threadId`, `createdAt`, with a unique index on `(userId, threadId)`.

### Step 2.5: Rich Attachments & Link Previews Logic
- **Observation**:
  - `ThreadPreviewCard.tsx:13-101` renders rich previews with `url`, `domain`, `title`, `headline`, `subheadline`, `tagline`, and background visual styling.
  - `PostComposerDialog.tsx:114-125` toolbar includes photo/video, GIF, voice note, and audio clip.
  - `ProfileTabsSection.tsx:46-50, 93-98` provides a "Media" tab.
- **Deduction**:
  - `thread_attachments` / `post_media` table: `id`, `threadId`, `mediaType` ('image' | 'video' | 'gif' | 'audio' | 'voice_note'), `url`, `thumbnailUrl`, `width`, `height`, `duration`, `order`.
  - `link_previews` table: `id`, `threadId`, `url`, `domain`, `title`, `headline`, `subheadline`, `tagline`, `imageUrl`.

### Step 2.6: Polls Feature Logic
- **Observation**: `PostComposerDialog.tsx:122` includes `RiListCheck` with action label "Add poll".
- **Deduction**:
  - `polls` table: `id`, `threadId`, `question`, `expiresAt`, `createdAt`.
  - `poll_options` table: `id`, `pollId`, `optionText`, `order`.
  - `poll_votes` table: `id`, `pollOptionId`, `userId`, `createdAt`, with unique constraint on `(pollOptionId, userId)`.

### Step 2.7: Communities & Topics Logic
- **Observation**:
  - `Sidebar.tsx:65-95` lists specific communities: Anime Threads, Design Threads, Business Threads, Teacher Threads, Tech Threads.
  - `PostComposerDialog.tsx:246-252` lets user post into `> Community or topic`.
  - `ProfileUser` in `src/features/profile/types.ts:10` contains `communities: string[]`.
- **Deduction**:
  - `communities` table: `id`, `slug` (unique), `name`, `description`, `icon`, `bannerUrl`, `creatorId`, `createdAt`.
  - `community_members` table: `id`, `communityId`, `userId`, `role` ('member' | 'moderator' | 'admin'), `joinedAt`.

### Step 2.8: User Moderation & Preferences Logic
- **Observation**:
  - `FeedHeader.tsx:53` includes "Hide posts from muted accounts".
  - `ThreadCard.tsx:75-78` menu includes "Mute author" and "Report".
  - `SearchHeader.tsx:90-95` includes "Search settings" and "Clear search history".
  - `FinishProfileCards.tsx:23-30` manages onboarding setup tasks ("Create thread", "1 left").
- **Deduction**:
  - `user_mutes` table: `id`, `muterId`, `mutedUserId`, `createdAt`.
  - `user_blocks` table: `id`, `blockerId`, `blockedUserId`, `createdAt`.
  - `post_reports` table: `id`, `reporterId`, `threadId`, `reason`, `createdAt`.
  - `search_history` table: `id`, `userId`, `query`, `createdAt`.
  - `user_profile_setup` table: `id`, `userId`, `taskKey`, `isCompleted`, `completedAt`.

---

## 3. Caveats

1. **Stub Pages**: The routes `/messages`, `/settings`, and `/account` are present in the filesystem (`page.tsx`) but only render empty `<div></div>`. Their exact UI features are inferred from feature directory names (`src/features/messages`, `src/features/settings`, `src/features/account`), navigation links, and standard Threads functionality.
2. **Commented-Out Navigation Items**: In `Sidebar.tsx`, the `communities` array (lines 65–95) and the `Messages` navigation link (lines 53–57) are commented out in JSX, but their assets (`/assets/icons/messages.svg`) and references in `PostComposerDialog` and `profile/types.ts` confirm they are part of the intended architecture.
3. **In-Memory UI State**: The existing interactive components currently use local `React.useState` with static mock data rather than backend API endpoints or database queries.
4. **Notifications**: An icon exists (`public/assets/icons/notifications.svg`) and is styled in `Sidebar.tsx:241`, but a dedicated `/notifications` route file does not yet exist.

---

## 4. Conclusion

The existing UI codebase represents a rich, federated, text-and-media social network with the following core feature pillars:

### Summary of Audit Findings
1. **Core Views**:
   - Centered 668px single-column feed with dual feed options ("For you" & "Following").
   - Instant search & discovery with user suggestions and search history controls.
   - Comprehensive user profile with multi-field bio editing, follower/following dialogs, onboarding checklist, and 4 content tabs (Threads, Replies, Media, Reposts).
   - Dedicated authentication system supporting credential login/registration and OAuth social providers (Google, GitHub) via Better-Auth.
2. **Interactive Capabilities**:
   - Multi-post chained thread publishing with topic assignment and drafts.
   - 10 attachment types (photo, video, GIF, reaction, emoji, voice note, audio clip, quote, poll, location, music).
   - Inline and preview card rich link displays.
   - Post interactions: Likes, Reposts, Comments/Replies, Shares, Saved/Bookmarks.
   - Social graph: Follow/unfollow, follower counts, mutual follower visual stack.
   - Moderation: Mute user, block user, report post.

### Entity Catalog Required for Drizzle ORM Schema
To support all features identified in this audit, the Drizzle ORM schema for SQLite / Cloudflare D1 must define the following tables:
1. `user`: Extended with username, bio, badges, privacy switches, and timestamps.
2. `session`: Better-Auth session storage.
3. `account`: Better-Auth OAuth & credential accounts.
4. `verification`: Better-Auth verification tokens.
5. `user_links`: Profile external links (website, podcast, social).
6. `follows`: Social graph connections (`followerId`, `followingId`).
7. `threads`: Posts, replies (`parentPostId`, `rootPostId`), chained threads (`orderInThread`), drafts, topics.
8. `likes`: Thread like relationships.
9. `reposts`: Thread repost relationships.
10. `saved_posts`: Bookmarked threads.
11. `thread_attachments`: Media attachments (images, videos, audio, voice notes).
12. `link_previews`: Structured metadata for embedded URL preview cards.
13. `polls`, `poll_options`, `poll_votes`: Poll data and user voting records.
14. `communities`, `community_members`: Communities and membership roles.
15. `user_mutes`, `user_blocks`, `post_reports`: Moderation tables.
16. `search_history`: User search queries.
17. `user_profile_setup`: Profile onboarding checklist tasks.

---

## 5. Verification Method

To independently verify the observations and conclusions in this report:

1. **Verify Routes**:
   ```bash
   find src/app -type f \( -name "page.tsx" -o -name "route.ts" -o -name "layout.tsx" \) | sort
   ```
   *Expected output*: 10 routes matching Section 1.1.

2. **Verify Feature Components & Dialogs**:
   ```bash
   find src/features -type f -name "*.tsx" | sort
   ```
   *Expected output*: All 18 feature components cataloged in Section 1.2.

3. **Verify Interactive Dialog Props & Fields**:
   - Inspect `src/features/composer/components/post-composer-dialog.tsx` for multi-post chaining and toolbar attachments.
   - Inspect `src/features/profile/components/edit-profile-dialog.tsx` for profile editing fields, privacy switches, and badges.
   - Inspect `src/features/profile/components/followers-dialog.tsx` for followers/following tabs and user toggle actions.

4. **Verify TypeScript Compilation**:
   ```bash
   pnpm tsc --noEmit
   ```
   *Expected result*: Exits with code 0.

5. **Invalidation Conditions**:
   - If routes under `src/app/` are altered or removed.
   - If existing UI components are removed or redesigned before schema implementation.
