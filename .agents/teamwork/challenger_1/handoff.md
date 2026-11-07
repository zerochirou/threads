# Empirical Handoff Report: Drizzle SQLite Schema Constraints & Cascade Testing

**Agent**: `challenger_1` (Empirical Challenger, Critic, Specialist)  
**Parent**: `b7bead26-b456-4ce8-bef6-2683740b0e72` (Orchestrator)  
**Date**: 2026-11-07T09:45:00Z  
**Target Milestone**: M1 — Schema Implementation, Relations & Constraints  
**Target Files**: `src/db/schema.ts`, `drizzle/0001_wealthy_abomination.sql`, `src/db/schema.adversarial.test.ts`  
**Verdict**: **REJECT** (Critical Foreign Key Cascade Bug in Generated Migration DDL)  

---

## 1. Observation

### 1.1 Empirical Test Suite & Execution
An empirical, adversarial test harness consisting of 21 test cases was created in `src/db/schema.adversarial.test.ts` to test constraints, compound unique indexes, nullability, defaults, and cascading foreign keys against real SQLite execution (`node:sqlite` with `PRAGMA foreign_keys = ON;`).

Test Execution Command:
```bash
node --experimental-strip-types --test src/db/schema.adversarial.test.ts
```

Verbatim Test Output:
```
▶ Adversarial Schema Testing: Unique Constraints
  ✔ should prevent duplicate user email (5.901125ms)
  ✔ should prevent duplicate username (4.860917ms)
  ✔ should prevent duplicate follow relationship (follower_id, following_id) (4.797291ms)
  ✔ should prevent duplicate community slug (4.570625ms)
  ✔ should prevent duplicate community member (community_id, user_id) (4.613166ms)
  ✔ should prevent duplicate poll vote per user (poll_id, user_id) (4.569083ms)
  ✔ should prevent duplicate thread likes (user_id, thread_id) (4.477167ms)
  ✔ should prevent duplicate thread reposts (user_id, thread_id) (4.432875ms)
  ✔ should prevent duplicate thread bookmarks (user_id, thread_id) (4.491708ms)
  ✔ should prevent duplicate user mutes (muter_id, muted_user_id) (4.459125ms)
  ✔ should prevent duplicate user onboarding tasks (user_id, task_key) (4.472875ms)
  ✔ should prevent duplicate conversation participants (conversation_id, user_id) (4.385916ms)
✔ Adversarial Schema Testing: Unique Constraints (56.627584ms)
▶ Adversarial Schema Testing: Cascade Deletes & Foreign Keys
  ✔ should cascade delete thread attachments when thread is deleted (4.700166ms)
  ✔ should cascade delete conversation participants and messages when conversation is deleted (4.523167ms)
  ✔ should set null on search_history.target_user_id when target user is deleted (4.715459ms)
  ✖ should cascade delete community_members and set null on threads.community_id when community is deleted (4.827708ms)
  ✖ should cascade delete replies when parent thread is deleted (4.706125ms)
  ✖ should cascade delete all user-related data when user is deleted even if others replied to their threads (4.784167ms)
✖ Adversarial Schema Testing: Cascade Deletes & Foreign Keys (28.36225ms)
▶ Adversarial Schema Testing: Nullability & Defaults
  ✔ should permit minimal Better Auth user insertion with correct default values (4.444791ms)
  ✔ should permit minimal thread insertion with correct default values (4.382792ms)
  ✔ should reject non-null fields when omitted (4.442833ms)
✔ Adversarial Schema Testing: Nullability & Defaults (13.320333ms)
ℹ tests 21 | suites 3 | pass 18 | fail 3
```

### 1.2 Discrepancy Between TypeScript Schema and Generated DDL
1. **In `src/db/schema.ts` (lines 218–232)**:
   ```ts
   parentThreadId: text("parent_thread_id").references(
     (): AnySQLiteColumn => threads.id,
     { onDelete: "cascade" }
   ),
   rootThreadId: text("root_thread_id").references(
     (): AnySQLiteColumn => threads.id,
     { onDelete: "cascade" }
   ),
   threadOrder: integer("thread_order").default(0).notNull(),
   replyPrivacy: text("reply_privacy").default("anyone").notNull(),
   isDraft: integer("is_draft", { mode: "boolean" }).default(false).notNull(),
   communityId: text("community_id").references(() => communities.id, {
     onDelete: "set null",
   }),
   ```
2. **In `drizzle/0001_wealthy_abomination.sql` (lines 267–272)**:
   ```sql
   ALTER TABLE `threads` ADD `parent_thread_id` text REFERENCES threads(id);--> statement-breakpoint
   ALTER TABLE `threads` ADD `root_thread_id` text REFERENCES threads(id);--> statement-breakpoint
   ALTER TABLE `threads` ADD `thread_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
   ALTER TABLE `threads` ADD `reply_privacy` text DEFAULT 'anyone' NOT NULL;--> statement-breakpoint
   ALTER TABLE `threads` ADD `is_draft` integer DEFAULT false NOT NULL;--> statement-breakpoint
   ALTER TABLE `threads` ADD `community_id` text REFERENCES communities(id);--> statement-breakpoint
   ```
   **Defect**: Drizzle Kit omitted `ON DELETE cascade` on `parent_thread_id` and `root_thread_id`, and omitted `ON DELETE set null` on `community_id`.

3. **Verbatim Runtime Errors in SQLite**:
   - Deleting a community with tagged threads throws:
     `AssertionError [ERR_ASSERTION]: Deleting community failed because foreign key lacks ON DELETE SET NULL: FOREIGN KEY constraint failed`
   - Deleting a parent thread with replies throws:
     `AssertionError [ERR_ASSERTION]: Deleting parent thread failed because foreign key lacks ON DELETE CASCADE: FOREIGN KEY constraint failed`
   - Deleting a user whose threads have replies from other users throws:
     `AssertionError [ERR_ASSERTION]: Deleting user with replied threads failed: FOREIGN KEY constraint failed`

---

## 2. Logic Chain

1. **Foreign Key Enforcement in SQLite / D1**:
   - Observation: SQLite foreign key enforcement is enabled via `PRAGMA foreign_keys = ON;`.
   - SQLite specification: When a foreign key column is defined with `REFERENCES table(col)` without an explicit `ON DELETE` clause, SQLite applies default action `NO ACTION` (which acts as `RESTRICT`).
2. **Impact on Thread Chaining & Replies**:
   - In `src/db/schema.ts`, multi-post chains and reply trees use `parent_thread_id` and `root_thread_id`.
   - Because `drizzle/0001_wealthy_abomination.sql` omitted `ON DELETE cascade`, when a user deletes a parent post, SQLite rejects the deletion because child replies still reference it.
   - Even worse: when a user account deletion is requested, SQLite cascade-deletes the user's threads. But if any other user has replied to one of those threads, SQLite attempts to delete the parent thread and fails with `FOREIGN KEY constraint failed`, completely blocking user account deletion!
3. **Impact on Communities**:
   - In `src/db/schema.ts`, `communityId` is configured with `onDelete: "set null"`.
   - Because `drizzle/0001_wealthy_abomination.sql` omitted `ON DELETE set null`, deleting a community fails with `FOREIGN KEY constraint failed` whenever any thread in the database is associated with that community.
4. **Remediation Feasibility**:
   - SQLite 3.51.0 supports column-level `ON DELETE` syntax in `ALTER TABLE ... ADD COLUMN`:
     ```sql
     ALTER TABLE `threads` ADD `parent_thread_id` text REFERENCES threads(id) ON DELETE cascade;
     ALTER TABLE `threads` ADD `root_thread_id` text REFERENCES threads(id) ON DELETE cascade;
     ALTER TABLE `threads` ADD `community_id` text REFERENCES communities(id) ON DELETE set null;
     ```
   - When verified with this exact patch in-memory, all 3 failing tests pass immediately (21 of 21 tests pass).

---

## 3. Caveats

1. **Verified vs Unverified Areas**:
   - All 12 compound and single unique indexes were verified empirically and pass without issue.
   - Better Auth user insertion with minimal fields `{ id, name, email }` passes and defaults all 6 boolean flags to false (`0`), nullable profile attributes to `null`, and timestamps to valid 13-digit Unix milliseconds.
   - Deleting isolated users or threads without replies cascades cleanly to all attachments, likes, reposts, bookmarks, reports, and notifications.
   - The failure is isolated specifically to the missing `ON DELETE` clauses in `drizzle/0001_wealthy_abomination.sql` on the altered `threads` table.

---

## 4. Conclusion

**Verdict: REJECT**

Milestone M1 cannot be approved in its current state because applying `drizzle/0001_wealthy_abomination.sql` produces a database schema with broken foreign key semantics that cause runtime `FOREIGN KEY constraint failed` crashes on:
1. Deleting any parent thread with replies.
2. Deleting any user whose threads have replies.
3. Deleting any community associated with threads.

### Required Remediation
Update `drizzle/0001_wealthy_abomination.sql` lines 267–272 to explicitly include the missing `ON DELETE` clauses:
```sql
ALTER TABLE `threads` ADD `parent_thread_id` text REFERENCES threads(id) ON DELETE cascade;--> statement-breakpoint
ALTER TABLE `threads` ADD `root_thread_id` text REFERENCES threads(id) ON DELETE cascade;--> statement-breakpoint
ALTER TABLE `threads` ADD `thread_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `threads` ADD `reply_privacy` text DEFAULT 'anyone' NOT NULL;--> statement-breakpoint
ALTER TABLE `threads` ADD `is_draft` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `threads` ADD `community_id` text REFERENCES communities(id) ON DELETE set null;--> statement-breakpoint
```

---

## 5. Verification Method

1. **Execute Empirical Adversarial Test Harness**:
   ```bash
   node --experimental-strip-types --test src/db/schema.adversarial.test.ts
   ```
   - *Current result*: Fails with 3 foreign key constraint errors on community deletion, parent thread deletion, and user cascade deletion.
   - *Passing condition after fix*: All 21 tests pass with 0 failures (`ℹ tests 21 | pass 21 | fail 0`).

2. **Verify TypeScript Typecheck**:
   ```bash
   pnpm exec tsc --noEmit
   ```
   - *Expected result*: Exit code `0` with 0 errors.
