# Dispatch: Worker M1 — Drizzle ORM Database Schema Implementation

## Mission
Implement the complete database schema for SQLite / Cloudflare D1 in `src/db/schema.ts` covering all user-facing features identified in the UI audit. Verify TypeScript type checking and migration generation.

## Mandatory Context Files (MUST READ FIRST)
- Original Request: `/Users/zerochirou/Developer/Projects/threads/.agents/teamwork/ORIGINAL_REQUEST.md`
- Project Scope: `/Users/zerochirou/Developer/Projects/threads/.agents/teamwork/orchestrator_1/PROJECT.md`
- Feature Catalog: `/Users/zerochirou/Developer/Projects/threads/.agents/teamwork/orchestrator_1/FEATURE_CATALOG.md`
- Explorer Reports:
  - `/Users/zerochirou/Developer/Projects/threads/.agents/teamwork/explorer_survey_1/handoff.md`
  - `/Users/zerochirou/Developer/Projects/threads/.agents/teamwork/explorer_survey_2/handoff.md`
  - `/Users/zerochirou/Developer/Projects/threads/.agents/teamwork/explorer_survey_3/handoff.md`
- Relevant Skill: `/Users/zerochirou/Developer/Projects/threads/.agents/skills/better-auth-best-practices/SKILL.md`

## Write Ownership
- Primary file: `src/db/schema.ts`
- Secondary / generated files: `drizzle/` (via `pnpm db:generate` if executed)

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Detailed Requirements & Implementation Rules
1. **Preserve Better Auth Core Tables**:
   - `user`, `session`, `account`, `verification` must maintain their existing columns and types for Better Auth compatibility.
   - Profile extensions added to `user` (`username`, `bio`, `verified`, `hasFollowBadge`, `isPrivate`, `showInstagramBadge`, `showRecentViews`, `podcastUrl`, `interests`) MUST be nullable or have sensible default values so Better Auth sign-up / OAuth flows do not fail.
2. **Implement All Entities Identified in Feature Catalog**:
   - `user` (extended with profile fields)
   - `session`, `account`, `verification`
   - `user_links` (external website/social links with order index)
   - `follows` (followerId, followingId, status, unique compound index)
   - `threads` (content, authorId, parentThreadId, rootThreadId, threadOrder, replyPrivacy, isDraft, communityId, likeCount, replyCount, repostCount, shareCount, timestamps)
   - `thread_media` (threadId, type, url, mimeType, width, height, durationSeconds, orderIndex)
   - `thread_link_previews` (threadId, url, domain, title, headline, subheadline, tagline, imageUrl)
   - `polls`, `poll_options`, `poll_votes` (poll voting)
   - `thread_locations` (threadId, name, latitude, longitude)
   - `thread_music` (threadId, title, artist, audioUrl, albumArtUrl)
   - `thread_likes` (userId, threadId, unique index)
   - `thread_reposts` (userId, threadId, quoteContent, unique index)
   - `thread_bookmarks` (userId, threadId, unique index)
   - `communities`, `community_members` (slug, name, description, icon, banner, roles)
   - `search_history` (userId, query, targetUserId, createdAt)
   - `user_mutes` (muterId, mutedUserId, unique index)
   - `thread_reports` (reporterId, threadId, reason, status)
   - `user_onboarding_tasks` (userId, taskKey, isCompleted, completedAt)
   - `notifications` (recipientId, actorId, type, threadId, isRead)
   - `conversations`, `conversation_participants`, `messages` (DMs)
3. **Drizzle Relational API**:
   - Export `*Relations` for all entities using Drizzle `relations(table, ({ one, many }) => ({ ... }))` so relational queries work seamlessly.
4. **Export Inferred TypeScript Types**:
   - Export `type User = typeof user.$inferSelect;`, `type NewUser = typeof user.$inferInsert;`, etc., for all tables.
5. **Verification**:
   - Run `pnpm exec tsc --noEmit` and ensure 0 TypeScript errors.
   - Run `pnpm db:generate` to verify Drizzle Kit generates SQL migrations cleanly without syntax or relation errors.

## Output Requirements
Write your handoff report to `/Users/zerochirou/Developer/Projects/threads/.agents/teamwork/worker_m1/handoff.md` following the Handoff Protocol. Include verification command outputs and layout compliance. When done, message the orchestrator.


## 2026-11-07T09:24:00Z
Read the mandatory context files first:
1. /Users/zerochirou/Developer/Projects/threads/.agents/teamwork/ORIGINAL_REQUEST.md
2. /Users/zerochirou/Developer/Projects/threads/.agents/teamwork/worker_m1/DISPATCH.md
3. /Users/zerochirou/Developer/Projects/threads/.agents/teamwork/orchestrator_1/PROJECT.md
4. /Users/zerochirou/Developer/Projects/threads/.agents/teamwork/orchestrator_1/FEATURE_CATALOG.md

Implement the complete Drizzle ORM database schema in src/db/schema.ts for SQLite / Cloudflare D1 following all requirements, relation mappings, and integrity constraints.
Run build/typecheck verification (pnpm exec tsc --noEmit and pnpm db:generate).
Write your complete handoff report to /Users/zerochirou/Developer/Projects/threads/.agents/teamwork/worker_m1/handoff.md.
When done, send a message to orchestrator.
