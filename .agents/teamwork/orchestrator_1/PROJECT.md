# Project: Threads UI Feature Analysis & SQLite/D1 Drizzle ORM Database Schema

## Architecture
- **Runtime**: Next.js 16 (App Router) on Cloudflare Workers via `@opennextjs/cloudflare`.
- **Database Engine**: Cloudflare D1 (embedded serverless SQLite).
- **ORM**: Drizzle ORM (`drizzle-orm/sqlite-core`, `drizzle-orm/d1`) v0.45.4 with Drizzle Kit v0.31.11.
- **Authentication**: Better Auth v1.7.18 with `@better-auth/drizzle-adapter` using `drizzleAdapter(db, { provider: "sqlite", schema })`.
- **Dialect**: SQLite (`sqliteTable`, `text`, `integer`, `index`, `uniqueIndex`, `foreignKey`).
- **Primary Keys**: `text("id").primaryKey()`.
- **Timestamps**: Millisecond timestamps `integer("created_at", { mode: "timestamp_ms" })` with default `sql\`(cast(unixepoch('subsecond') * 1000 as integer))\``.
- **Booleans**: SQLite integers `integer("...", { mode: "boolean" })`.
- **Relations**: Drizzle ORM `relations()` definitions for all 1:1, 1:many, and many:many relationships.

## Feature Inventory
All user-facing features identified from the UI survey across `src/app/`, `src/features/`, and `src/components/`:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Better Auth Core | User auth, email/password, OAuth (Google/GitHub), sessions, accounts, verifications | M1 | `src/features/auth/`, `src/lib/auth.ts` |
| 2 | User Profile Extensions | Extended profile fields: `username` (unique), `bio`, `verified`, `hasFollowBadge`, `isPrivate`, `showInstagramBadge`, `showRecentViews`, `podcastUrl`, `interests` | M1 | `src/features/profile/components/edit-profile-dialog.tsx`, `profile-bio.tsx` |
| 3 | Profile External Links | Multiple external website/social links with order indexing (`user_links`) | M1 | `src/features/profile/components/edit-profile-dialog.tsx`, `profile/types.ts` |
| 4 | Social Graph (Follows) | Following, followers, mutual follower counts, pending/accepted follow requests | M1 | `src/features/profile/components/followers-dialog.tsx`, `follow-suggestions.tsx` |
| 5 | Chained Threads & Replies | Multi-post sequential threads (`ThreadEntry[]`), nested replies (`parentThreadId`, `rootThreadId`), thread ordering (`threadOrder`), reply privacy controls, draft flags | M1 | `src/features/composer/components/post-composer-dialog.tsx`, `thread-card.tsx` |
| 6 | Media Attachments | Photos, videos, animated GIFs, audio clips, voice notes with type, URL, dimensions, and ordering | M1 | `src/features/composer/components/post-composer-dialog.tsx:114-125` |
| 7 | Link Previews | OpenGraph rich preview cards: domain, url, title, headline, subheadline, tagline, image | M1 | `src/features/content-scrollbar/components/thread-preview-card.tsx` |
| 8 | Thread Likes | Heart like/unlike toggle, like counts, `/liked` feed | M1 | `src/features/content-scrollbar/components/thread-actions.tsx`, `sidebar.tsx` |
| 9 | Thread Reposts & Quotes | Reposting and quoting threads with optional commentary, profile Reposts tab | M1 | `src/features/content-scrollbar/components/thread-actions.tsx`, `profile-tabs-section.tsx` |
| 10 | Thread Bookmarks / Saved | Bookmark toggle, saved threads feed (`/saved`) | M1 | `src/features/commons/components/sidebar.tsx:296` |
| 11 | Polls & Voting | Composer poll attachment (`RiListCheck`): poll question, options, expiry, unique user voting | M1 | `src/features/composer/components/post-composer-dialog.tsx:122` |
| 12 | Communities & Memberships | Topic communities (Anime, Design, Business, Teacher, Tech), memberships, roles | M1 | `src/features/commons/components/sidebar.tsx:65-95`, `post-composer-dialog.tsx:246` |
| 13 | Search & History | User/thread search, filters, search query history, clear search history | M1 | `src/features/search/components/search-header.tsx`, `search-view.tsx` |
| 14 | Moderation (Mutes & Reports) | Mute user, hide posts from muted accounts, report post for moderation | M1 | `src/features/content-scrollbar/components/thread-card.tsx:75-78`, `feed-header.tsx` |
| 15 | Profile Setup / Onboarding | Checklist tasks carousel ("Finish your profile", "1 left", completion states) | M1 | `src/features/profile/components/finish-profile-cards.tsx` |
| 16 | Notifications / Activity | Alerts for likes, replies, reposts, follows, mentions (`/assets/icons/notifications.svg`) | M1 | `public/assets/icons/notifications.svg`, `DESIGN.md` |
| 17 | Direct Messages / Chat | Conversations, participants, direct messages (`/messages`, `/assets/icons/messages.svg`) | M1 | `src/app/(home)/messages/`, `src/features/messages/` |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Schema Implementation & Relations | Define all tables, columns, constraints, foreign keys, indexes, and relations in `src/db/schema.ts` | Survey | IN_PROGRESS |
| M2 | Verification & Audit | Verify TypeScript compilation (`tsc --noEmit`), migration generation (`db:generate`), Reviewers, Challengers, and Forensic Auditor | M1 | PLANNED |

## Interface Contracts
### `src/db/schema.ts` ↔ Better Auth (`src/lib/auth.ts`)
- Core tables `user`, `session`, `account`, and `verification` retain all existing column names and modes (`id`, `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`, `token`, `expiresAt`, `ipAddress`, `userAgent`, `userId`, `accountId`, `providerId`, `password`, `identifier`, `value`).
- Profile extensions added to `user` (`username`, `bio`, `verified`, `hasFollowBadge`, `isPrivate`, `showInstagramBadge`, `showRecentViews`, `podcastUrl`, `interests`) MUST be nullable or have `.default(...)` so Better Auth sign-up / OAuth creation flows never violate NOT NULL constraints.

### `src/db/schema.ts` ↔ Cloudflare D1 Client (`src/db/index.ts`)
- Schema is exported via `* as schema` from `./schema`.
- Drizzle client initialized with `drizzle(env.DB, { schema })`.
- Types exported: `User`, `Thread`, `Like`, `Follow`, `MediaAttachment`, `LinkPreview`, etc., for type-safe queries.

## Code Layout
- `src/db/schema.ts`: Single source of truth for all Drizzle SQLite table definitions and Drizzle relational mappings.
- `src/db/index.ts`: Database client initialization using Cloudflare D1 context and schema re-export.
- `drizzle.config.ts`: Drizzle Kit configuration pointing to `./src/db/schema.ts` and `./drizzle`.
- `drizzle/`: Migration SQL files generated via `pnpm db:generate`.
