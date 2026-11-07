# Handoff Report: Project Architecture, Drizzle ORM, SQLite/D1 & Auth Survey

## 1. Observation

### 1.1 Project Structure & Core Dependencies
Inspection of `/Users/zerochirou/Developer/Projects/threads/package.json` reveals:
- **Package Manager**: `pnpm@12.9.1` (`package.json:48`)
- **Framework**: Next.js `16.4.5` (`package.json:27`), React `19.3.0` (`package.json:29`), React DOM `19.3.0` (`package.json:30`), with `babel-plugin-react-compiler: 1.0.0` (`package.json:40`)
- **Cloudflare Runtime**: `@opennextjs/cloudflare: ^1.20.16` (`package.json:35`), `wrangler: ^4.158.0` (`package.json:46`)
- **ORM & DB Tooling**: `drizzle-orm: ^0.45.4` (`package.json:26`), `drizzle-kit: ^0.31.11` (`package.json:41`)
- **Authentication**: `better-auth: ^1.7.18` (`package.json:23`), `@better-auth/drizzle-adapter: ^1.7.18` (`package.json:21`)
- **UI Stack**: `@base-ui/react: ^1.9.0` (`package.json:20`), `shadcn: ^4.23.0` (`package.json:31`), `@remixicon/react: ^4.9.0` (`package.json:22`), `tailwindcss: ^4` (`package.json:44`), `next-themes: ^0.4.6` (`package.json:28`)

Scripts defined in `package.json` (lines 5-18):
- `"build": "next build"`
- `"dev": "next dev"`
- `"lint": "eslint"`
- `"preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview"`
- `"deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"`
- `"cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"`
- `"db:generate": "drizzle-kit generate"`
- `"db:migrate:local": "wrangler d1 migrations apply threads-db --local"`
- `"db:migrate:remote": "wrangler d1 migrations apply threads-db --remote"`
- `"db:studio": "drizzle-kit studio"`

### 1.2 TypeScript Configuration
Inspection of `/Users/zerochirou/Developer/Projects/threads/tsconfig.json`:
- `target`: `"ES2017"` (`tsconfig.json:3`)
- `strict`: `true` (`tsconfig.json:7`)
- `noEmit`: `true` (`tsconfig.json:8`)
- `moduleResolution`: `"bundler"` (`tsconfig.json:11`)
- Path alias: `"@/*": ["./src/*"]` (`tsconfig.json:21-23`)
- Typecheck execution `pnpm exec tsc --noEmit` exited cleanly with code `0`.

### 1.3 Cloudflare D1 & Worker Configuration
Inspection of `/Users/zerochirou/Developer/Projects/threads/wrangler.jsonc`:
- Worker entry: `main: ".open-next/worker.js"` (`wrangler.jsonc:3`)
- Compatibility date: `"2026-11-06"` (`wrangler.jsonc:5`)
- Compatibility flags: `["nodejs_compat", "global_fetch_strictly_public"]` (`wrangler.jsonc:6-9`)
- D1 Databases definition (`wrangler.jsonc:23-30`):
  ```json
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "threads-db",
      "database_id": "cfc47db2-2891-4d44-827e-2b184603f936",
      "migrations_dir": "drizzle"
    }
  ]
  ```
- Assets binding: `"ASSETS"` mapped to `".open-next/assets"` (`wrangler.jsonc:10-13`)
- Images binding: `"IMAGES"` (`wrangler.jsonc:20-22`)
- OpenNext config: `/Users/zerochirou/Developer/Projects/threads/open-next.config.ts` uses `defineCloudflareConfig({})`.
- Environment interface in `cloudflare-env.d.ts` exposes `DB: D1Database;`, `BETTER_AUTH_SECRET: string;`, `BETTER_AUTH_URL: string;`, etc.

### 1.4 Drizzle ORM Configuration & DB Client
Inspection of `/Users/zerochirou/Developer/Projects/threads/drizzle.config.ts`:
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
});
```
Inspection of `/Users/zerochirou/Developer/Projects/threads/src/db/index.ts`:
```typescript
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });

  if (!env.DB) {
    throw new Error("D1 database binding 'DB' is not available in Cloudflare context.");
  }

  return drizzle(env.DB, { schema });
}

export { schema };
export type Database = Awaited<ReturnType<typeof getDb>>;
```

Existing Migration SQL `/Users/zerochirou/Developer/Projects/threads/drizzle/0000_absurd_grim_reaper.sql`:
- Defines tables: `account`, `session`, `threads`, `user`, `verification` with foreign key constraints and indexes.

### 1.5 Authentication Architecture (Better Auth)
Inspection of `/Users/zerochirou/Developer/Projects/threads/src/lib/auth.ts`:
- Server auth function: `export async function getAuth()`
- Obtains Cloudflare bindings via `await getCloudflareContext({ async: true })`
- Passes D1 drizzle instance to `drizzleAdapter(db, { provider: "sqlite", schema })`
- Features enabled:
  - `emailAndPassword: { enabled: true }`
  - `socialProviders: { google, github }`
  - `account: { accountLinking: { enabled: true } }`
  - `plugins: [nextCookies()]` from `better-auth/next-js`
  - `trustedOrigins: ["http://localhost:3000", "http://localhost:8787", baseURL]`
- Client auth `/Users/zerochirou/Developer/Projects/threads/src/lib/auth-client.ts`:
  - `export const authClient = createAuthClient();`
  - Exports: `signIn, signUp, signOut, useSession, getSession`
- Auth Route Handler `/Users/zerochirou/Developer/Projects/threads/src/app/api/auth/[...all]/route.ts`:
  - Forwards `GET` and `POST` directly to `auth.handler(request)`

### 1.6 Current Schema Content in `src/db/schema.ts`
Currently defined tables (lines 4-103):
1. `user`: `id` (text, PK), `name` (text), `email` (text, unique), `emailVerified` (integer boolean), `image` (text, nullable), `createdAt` (integer timestamp_ms), `updatedAt` (integer timestamp_ms).
2. `session`: `id` (text, PK), `expiresAt` (integer timestamp_ms), `token` (text, unique), `createdAt`, `updatedAt`, `ipAddress` (text), `userAgent` (text), `userId` (text, FK -> user.id onDelete cascade), index on `userId`.
3. `account`: `id` (text, PK), `accountId` (text), `providerId` (text), `userId` (text, FK -> user.id onDelete cascade), `accessToken`, `refreshToken`, `idToken`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`, `scope`, `password`, `createdAt`, `updatedAt`, index on `userId`.
4. `verification`: `id` (text, PK), `identifier` (text), `value` (text), `expiresAt`, `createdAt`, `updatedAt`, index on `identifier`.
5. `threads`: `id` (text, PK), `content` (text), `authorId` (text, FK -> user.id onDelete cascade), `createdAt`, `updatedAt`.
Relations: `userRelations`, `sessionRelations`, `accountRelations`, `threadsRelations`.

### 1.7 UI Features & Data Requirements Discovered in UI Inspection
1. **Thread Composer (`src/features/composer/components/post-composer-dialog.tsx`)**:
   - Multi-post threads: Users can chain multiple posts into a single published thread (`ThreadEntry[]` with `addThread`).
   - Drafts: "Save draft", "Delete draft", "Drafts" tooltip (`post-composer-dialog.tsx:162-208`).
   - Community / Topic tag: Option to tag thread to a community or topic (`post-composer-dialog.tsx:246-253`).
   - Attachment Toolbar: Photos/videos, GIF, reactions, emoji, voice note, audio clip, quotes, polls, locations, music (`post-composer-dialog.tsx:114-125`).
   - Post Options / Reply Permissions: Reply control settings (`post-composer-dialog.tsx:345-353`).
2. **Post Display & Feed (`src/features/content-scrollbar/`)**:
   - Post data model `ThreadPostItem` (`types.ts:21-32`): `id`, `author` (`username`, `avatarUrl`, `fallback`, `verified`, `hasFollowBadge`, `badges`), `timeAgo`, `content`, `likeCount`, `commentCount`, `repostCount`, `shareCount`, `isLiked`, `linkPreview` (`url`, `domain`, `title`, `headline`, `subheadline`, `tagline`).
   - Actions (`thread-actions.tsx`): Like toggle, Comment/Reply, Repost, Share.
   - Post Dropdown (`thread-card.tsx:54-81`): "Copy link", "Mute author", "Report".
3. **Profile View & Edit Profile (`src/features/profile/`)**:
   - User profile model `ProfileUser` (`types.ts:1-16`): `name`, `username`, `bio`, `avatarUrl`, `followersCount`, `followingCount`, `followerAvatars`, `link` (`label`, `url`, `extraCount`), `communities`, `extraCommunitiesCount`.
   - Edit Profile dialog (`edit-profile-dialog.tsx:39-266`):
     - Name, Username, Bio
     - Interests (e.g. "AnimeThreads, DesignThreads, BusinessThreads...")
     - Multiple External Links (`Links: 2`)
     - Podcast URL (`+ Link to your podcast`)
     - Toggle: `showInstagramBadge` (boolean)
     - Toggle: `showRecentViews` (boolean)
     - Privacy: Profile privacy Public / Private (`isPrivate` boolean)
   - Profile tabs (`profile-tabs-section.tsx:33-57`):
     - Threads
     - Replies
     - Media
     - Reposts
   - Finish Profile setup cards (`finish-profile-cards.tsx`): `cards` with `isDone`, `remainingCount`.
   - Followers / Following dialog (`followers-dialog.tsx`): lists followers and followings with `toggleFollow` action.
4. **Feeds & Navigation (`src/features/commons/components/sidebar.tsx`)**:
   - Feeds: "For you" (`/`), "Following" (`/?feed=following`), "Saved" (`/saved`), "Liked" (`/liked`).
   - Navigation: Home, Search, Profile, Messages (`/messages`), Settings (`/settings`), Insights (`/insights`).
   - Communities: Anime Threads, Design Threads, Business Threads, Teacher Threads, Tech Threads.
5. **Search & Discovery (`src/features/search/`)**:
   - Search input, filter toggle (`search-header.tsx:36-60`).
   - Search options: "Search settings", "Clear search history" (`search-header.tsx:89-96`).
   - Search results list (`SearchResultItem`): user cards with follow button and follower counts.
6. **Follow Suggestions (`src/features/home/components/follow-suggestions.tsx`)**:
   - User suggestions with `mutualFollowers`, `verified` badge, `followersCount`, `isFollowing`.

---

## 2. Logic Chain

1. **Runtime & Storage Logic**:
   - The application runs on Cloudflare Workers via `@opennextjs/cloudflare`.
   - Cloudflare D1 provides an embedded serverless SQLite engine accessible through the Worker environment binding `env.DB`.
   - Therefore, the Drizzle ORM configuration must use `dialect: "sqlite"` and the D1 adapter `drizzle-orm/d1`.
   - Migrations are managed by `drizzle-kit` and applied via Wrangler (`wrangler d1 migrations apply threads-db`).

2. **Drizzle ORM & SQLite Type Constraints**:
   - **IDs**: SQLite does not support native UUID or NanoID types. Consistent with Better Auth and the existing `user` and `threads` tables, all primary keys must be `text("id").primaryKey()`.
   - **Timestamps**: Cloudflare D1 stores timestamps as integer Unix epoch. To ensure compatibility with JavaScript `Date` objects and Better Auth, timestamps must use:
     `integer("created_at", { mode: "timestamp_ms" }).default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).notNull()`
     `updatedAt` uses `.$onUpdate(() => new Date())`.
   - **Booleans**: SQLite lacks a boolean primitive. Drizzle maps booleans using `integer("col", { mode: "boolean" })`.
   - **Foreign Keys**: Cascade delete is supported via `.references(() => table.id, { onDelete: "cascade" })`.
   - **Indexes**: In Drizzle ORM v0.45.x, table indexes are passed via the third callback argument returning an array of index definitions: `(table) => [index("...").on(table.column)]`.

3. **Better Auth Compatibility Logic**:
   - Better Auth runtime automatically performs schema validation against `db` during adapter initialization (`drizzleAdapter(db, { provider: "sqlite", schema })`).
   - Better Auth expects the core tables `user`, `session`, `account`, and `verification` to strictly contain its required columns.
   - If profile columns (e.g. `username`, `bio`, `verified`, `isPrivate`) are added directly to `user`:
     - They must be either `.nullable()` or have `.default(...)` values so Better Auth internal user-creation flows (such as OAuth or standard credential sign-up) do not fail with NOT NULL constraint violations.
     - Better Auth configuration in `src/lib/auth.ts` can declare custom fields under `user: { additionalFields: { ... } }`, or a separate 1:1 `profiles` / `user_profiles` table can be maintained to completely isolate social profile state from authentication state.
     - Given that the UI tightly couples `username` with authentication and profile display (e.g. login with username, search user by username), having `username` (unique, nullable for initial OAuth, or defaulted) and profile attributes on the `user` table with default values, or extending via a dedicated `user_profiles` table, is standard. Best practice: extend `user` with optional/defaulted profile fields (`username`, `bio`, `verified`, `isPrivate`, `showInstagramBadge`, `showRecentViews`, `podcastUrl`, `interests`) and configure `user.additionalFields` in Better Auth.

4. **Schema Completeness Logic (Translating UI Features to Tables)**:
   - **Threads & Nested Replies**: The current `threads` table lacks parent/reply relationships, media attachments, link previews, and multi-thread ordering.
     - Add `parentThreadId` (self-referencing FK `threads.id`) to support replies and comments.
     - Add `rootThreadId` (optional FK `threads.id`) to query entire reply trees efficiently.
     - Add `threadOrder` (integer, default 0) to support multi-post chain threads composed in `PostComposerDialog`.
     - Add `replyPrivacy` (text, default "everyone") for composer post options.
     - Add `isDraft` (integer boolean, default false) for the drafts feature.
   - **Media Attachments**: Composer supports photos, videos, GIFs, audio clips, voice notes.
     - Table `thread_media`: `id`, `threadId` (FK), `type` (image/video/gif/audio), `url`, `aspectRatio`, `orderIndex`, `createdAt`.
   - **Link Previews**: `ThreadCard` renders rich link previews (`url`, `domain`, `title`, `headline`, `subheadline`, `tagline`).
     - Table `thread_link_previews`: `id`, `threadId` (FK, unique), `url`, `domain`, `title`, `headline`, `subheadline`, `tagline`, `createdAt`.
   - **Likes**: `ThreadActions` and Sidebar `/liked` require tracking which user liked which thread.
     - Table `thread_likes`: `id`, `userId` (FK), `threadId` (FK), `createdAt`, with a unique index on `(userId, threadId)`.
   - **Reposts**: Profile Reposts tab and `ThreadActions` repost counter require tracking reposts and optional quote content.
     - Table `thread_reposts`: `id`, `userId` (FK), `threadId` (FK), `quoteContent` (text, nullable), `createdAt`, with a unique index on `(userId, threadId)`.
   - **Bookmarks / Saved**: Sidebar `/saved` requires persisting bookmarked posts.
     - Table `thread_bookmarks`: `id`, `userId` (FK), `threadId` (FK), `createdAt`, with a unique index on `(userId, threadId)`.
   - **Follows**: `FollowSuggestions`, `FollowersDialog`, `SearchView`, and `/?feed=following` require a bidirectional social graph.
     - Table `follows`: `id`, `followerId` (FK -> user.id), `followingId` (FK -> user.id), `status` ("accepted" | "pending"), `createdAt`, with a unique index on `(followerId, followingId)`.
   - **Profile External Links**: `EditProfileDialog` shows `Links: 2` and `ProfileUser` has `link: { label, url, extraCount }`.
     - Table `user_links`: `id`, `userId` (FK), `label`, `url`, `orderIndex`, `createdAt`.
   - **Search History**: `SearchHeader` has "Clear search history".
     - Table `search_history`: `id`, `userId` (FK), `query`, `targetUserId` (FK, nullable), `createdAt`.
   - **Notifications / Activity**: Required for likes, replies, reposts, and follows.
     - Table `notifications`: `id`, `recipientId` (FK), `actorId` (FK), `type` ("like" | "reply" | "repost" | "follow" | "mention"), `threadId` (FK, nullable), `isRead` (integer boolean), `createdAt`.
   - **Direct Messages**: Required for `/messages` route and icon.
     - Tables `conversations`, `conversation_participants`, and `messages`.

5. **Drizzle Relations Logic**:
   - Drizzle's relational query API (`db.query.threads.findMany({ with: { author: true, likes: true, replies: true } })`) requires defining `relations(table, ({ one, many }) => ({ ... }))` for every relationship.
   - All defined entities must export corresponding `*Relations` objects in `src/db/schema.ts`.

---

## 3. Caveats

1. **D1 SQLite vs Standard SQLite Drivers**:
   - In Cloudflare D1, transactions run differently than in standard SQLite with file locks. D1 operations are executed over HTTP or worker bindings. Batch statements (`db.batch([...])`) should be used when multiple inserts/updates must succeed atomically.
2. **Better Auth Runtime Schema Validation**:
   - If non-nullable columns without defaults are added to the `user` table, Better Auth's signup and OAuth callbacks will fail when creating new users. All custom profile fields added to `user` must either have sensible defaults (e.g. `.default(false)` for booleans, `""` or null for bio) or be nullable.
3. **Draft Threads in SQLite**:
   - Draft posts created in the composer can be represented as `threads` rows with `isDraft: true`, or in a separate `drafts` table. Modeling as `isDraft: integer({ mode: "boolean" }).default(false)` on `threads` keeps the schema clean and allows drafts to contain the exact same fields as published threads.
4. **Counter Caches vs Real-Time Count**:
   - In SQLite/D1, running `count()` over indexed foreign keys is fast. However, adding denormalized counter columns (`likeCount`, `replyCount`, `repostCount`) on the `threads` table simplifies matching the frontend's `ThreadPostItem` interface (`post.likeCount`). If included, these should default to `0`.

---

## 4. Conclusion

The project's technical architecture is a clean Next.js 16 (Turbopack) application deployed to Cloudflare Workers using OpenNext, with Cloudflare D1 SQLite and Better Auth.

### Technical Invariants & Rules for Schema Design:
1. **Dialect**: Strictly `"sqlite"` via `drizzle-orm/sqlite-core`.
2. **Schema Entry Point**: `src/db/schema.ts` (as configured in `drizzle.config.ts`).
3. **Primary Keys**: `text("id").primaryKey()`.
4. **Timestamps**: `integer("created_at", { mode: "timestamp_ms" }).default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).notNull()`.
5. **Booleans**: `integer("...", { mode: "boolean" })` with `.default(false)` or `.default(true)`.
6. **Foreign Keys**: Always specify `.references(() => targetTable.id, { onDelete: "cascade" })`.
7. **Indexes**: Use the Drizzle v0.45 array syntax `(table) => [index("...").on(table.column)]`.
8. **Relations**: Define bidirectional `relations()` for every table to support Drizzle relational queries.
9. **Better Auth Preservation**: Preserve exact names and types of `user`, `session`, `account`, and `verification`. Profile attributes added to `user` must be nullable or defaulted.

### Comprehensive Catalog of Database Entities to Implement:

| Entity / Table Name | Primary Purpose / UI Mapping | Key Columns |
|---|---|---|
| `user` (core auth + profile) | User accounts & public profile (Better Auth + Edit Profile) | `id`, `name`, `email`, `emailVerified`, `image`, `username`, `bio`, `verified`, `isPrivate`, `showInstagramBadge`, `showRecentViews`, `podcastUrl`, `interests`, `createdAt`, `updatedAt` |
| `session` | User sessions (Better Auth) | `id`, `expiresAt`, `token`, `ipAddress`, `userAgent`, `userId`, `createdAt`, `updatedAt` |
| `account` | OAuth & credentials (Better Auth) | `id`, `accountId`, `providerId`, `userId`, `accessToken`, `refreshToken`, `password`, etc. |
| `verification` | Email verification & tokens (Better Auth) | `id`, `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt` |
| `user_links` | Profile external links ("Links: 2") | `id`, `userId`, `label`, `url`, `orderIndex`, `createdAt` |
| `follows` | Follows, followers, following feed | `id`, `followerId`, `followingId`, `status` ("accepted"/"pending"), `createdAt` |
| `threads` | Posts, replies, multi-post chains, drafts | `id`, `authorId`, `content`, `parentThreadId` (nullable, reply), `rootThreadId` (nullable), `threadOrder` (int), `replyPrivacy`, `isDraft` (bool), `likeCount`, `replyCount`, `repostCount`, `shareCount`, `createdAt`, `updatedAt` |
| `thread_media` | Image, video, GIF, audio attachments | `id`, `threadId`, `type` ("image"/"video"/"gif"/"audio"), `url`, `aspectRatio`, `orderIndex`, `createdAt` |
| `thread_link_previews` | Rich link preview cards | `id`, `threadId`, `url`, `domain`, `title`, `headline`, `subheadline`, `tagline`, `createdAt` |
| `thread_likes` | Post likes & liked feed (`/liked`) | `id`, `userId`, `threadId`, `createdAt` (Unique index on `userId, threadId`) |
| `thread_reposts` | Post reposts & reposts tab | `id`, `userId`, `threadId`, `quoteContent` (nullable), `createdAt` (Unique index on `userId, threadId`) |
| `thread_bookmarks` | Saved posts feed (`/saved`) | `id`, `userId`, `threadId`, `createdAt` (Unique index on `userId, threadId`) |
| `search_history` | Recent user searches & clear history | `id`, `userId`, `query`, `targetUserId` (nullable), `createdAt` |
| `notifications` | Activity and event alerts | `id`, `recipientId`, `actorId`, `type`, `threadId`, `isRead`, `createdAt` |
| `conversations` | Direct messaging threads (`/messages`) | `id`, `type` ("direct"/"group"), `createdAt`, `updatedAt` |
| `conversation_participants` | DM participant membership | `id`, `conversationId`, `userId`, `joinedAt` |
| `messages` | Direct chat messages | `id`, `conversationId`, `senderId`, `content`, `createdAt` |

---

## 5. Verification Method

To independently verify all findings and validate future schema implementations:

1. **Type Check**:
   ```bash
   pnpm exec tsc --noEmit
   ```
   *Expected result*: Exit code 0, 0 errors.

2. **Drizzle Migration Generation**:
   ```bash
   pnpm db:generate
   ```
   *Expected result*: Generates clean SQL migration files under `./drizzle/` matching SQLite DDL syntax without schema generation errors.

3. **ESLint**:
   ```bash
   pnpm lint
   ```
   *Expected result*: 0 errors.

4. **Verify Health Endpoint DB Access**:
   Inspect `/Users/zerochirou/Developer/Projects/threads/src/app/api/health/route.ts`:
   Executes `const db = await getDb(); const users = await db.select().from(schema.user).all();`.
   Confirms DB client initialization, context resolution, and query execution against `schema`.

5. **Invalidation Conditions**:
   - Modifying `drizzle.config.ts` dialect from `sqlite` or changing `schema` path from `./src/db/schema.ts`.
   - Modifying Better Auth core column types in `user`, `session`, `account`, or `verification` without updating Better Auth options.
   - Introducing SQLite-unsupported data types (e.g. `uuid()`, `timestamp()` from PostgreSQL core instead of `sqlite-core`).
