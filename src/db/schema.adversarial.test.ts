import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
// @ts-ignore
import { DatabaseSync } from "node:sqlite";

function setupDatabase(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");

  const m0Path = path.resolve(process.cwd(), "drizzle/0000_absurd_grim_reaper.sql");
  const m1Path = path.resolve(process.cwd(), "drizzle/0001_wealthy_abomination.sql");

  const m0 = fs.readFileSync(m0Path, "utf-8");
  for (const stmt of m0.split("--> statement-breakpoint")) {
    const s = stmt.trim();
    if (s) db.exec(s);
  }

  const m1 = fs.readFileSync(m1Path, "utf-8");
  for (const stmt of m1.split("--> statement-breakpoint")) {
    const s = stmt.trim();
    if (s) db.exec(s);
  }

  return db;
}

describe("Adversarial Schema Testing: Unique Constraints", () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = setupDatabase();
    db.exec(`
      INSERT INTO user (id, name, email, username) VALUES ('u1', 'User 1', 'u1@example.com', 'user1');
      INSERT INTO user (id, name, email, username) VALUES ('u2', 'User 2', 'u2@example.com', 'user2');
      INSERT INTO threads (id, author_id, content) VALUES ('th1', 'u1', 'Thread 1');
      INSERT INTO communities (id, slug, name) VALUES ('comm1', 'tech', 'Tech');
      INSERT INTO polls (id, thread_id, question) VALUES ('poll1', 'th1', 'Favorite language?');
      INSERT INTO poll_options (id, poll_id, option_text, order_index) VALUES ('opt1', 'poll1', 'TypeScript', 0);
      INSERT INTO poll_options (id, poll_id, option_text, order_index) VALUES ('opt2', 'poll1', 'Rust', 1);
      INSERT INTO conversations (id, type) VALUES ('conv1', 'direct');
    `);
  });

  it("should prevent duplicate user email", () => {
    assert.throws(
      () => {
        db.exec("INSERT INTO user (id, name, email) VALUES ('u3', 'User 3', 'u1@example.com');");
      },
      /constraint/i,
      "Duplicate email must violate unique constraint"
    );
  });

  it("should prevent duplicate username", () => {
    assert.throws(
      () => {
        db.exec("INSERT INTO user (id, name, email, username) VALUES ('u3', 'User 3', 'u3@example.com', 'user1');");
      },
      /constraint/i,
      "Duplicate username must violate unique constraint"
    );
  });

  it("should prevent duplicate follow relationship (follower_id, following_id)", () => {
    db.exec("INSERT INTO follows (id, follower_id, following_id) VALUES ('f1', 'u1', 'u2');");
    assert.throws(
      () => {
        db.exec("INSERT INTO follows (id, follower_id, following_id) VALUES ('f2', 'u1', 'u2');");
      },
      /constraint/i,
      "Duplicate follow must violate unique constraint"
    );
  });

  it("should prevent duplicate community slug", () => {
    assert.throws(
      () => {
        db.exec("INSERT INTO communities (id, slug, name) VALUES ('comm2', 'tech', 'Duplicate Tech');");
      },
      /constraint/i,
      "Duplicate community slug must violate unique constraint"
    );
  });

  it("should prevent duplicate community member (community_id, user_id)", () => {
    db.exec("INSERT INTO community_members (id, community_id, user_id) VALUES ('cm1', 'comm1', 'u1');");
    assert.throws(
      () => {
        db.exec("INSERT INTO community_members (id, community_id, user_id) VALUES ('cm2', 'comm1', 'u1');");
      },
      /constraint/i,
      "Duplicate community membership must violate unique constraint"
    );
  });

  it("should prevent duplicate poll vote per user (poll_id, user_id)", () => {
    db.exec("INSERT INTO poll_votes (id, poll_id, poll_option_id, user_id) VALUES ('pv1', 'poll1', 'opt1', 'u1');");
    assert.throws(
      () => {
        // Even voting for a different option in the same poll must fail
        db.exec("INSERT INTO poll_votes (id, poll_id, poll_option_id, user_id) VALUES ('pv2', 'poll1', 'opt2', 'u1');");
      },
      /constraint/i,
      "Duplicate poll vote by same user on same poll must violate unique constraint"
    );
  });

  it("should prevent duplicate thread likes (user_id, thread_id)", () => {
    db.exec("INSERT INTO thread_likes (id, user_id, thread_id) VALUES ('tl1', 'u1', 'th1');");
    assert.throws(
      () => {
        db.exec("INSERT INTO thread_likes (id, user_id, thread_id) VALUES ('tl2', 'u1', 'th1');");
      },
      /constraint/i,
      "Duplicate thread like must violate unique constraint"
    );
  });

  it("should prevent duplicate thread reposts (user_id, thread_id)", () => {
    db.exec("INSERT INTO thread_reposts (id, user_id, thread_id) VALUES ('tr1', 'u1', 'th1');");
    assert.throws(
      () => {
        db.exec("INSERT INTO thread_reposts (id, user_id, thread_id) VALUES ('tr2', 'u1', 'th1');");
      },
      /constraint/i,
      "Duplicate thread repost must violate unique constraint"
    );
  });

  it("should prevent duplicate thread bookmarks (user_id, thread_id)", () => {
    db.exec("INSERT INTO thread_bookmarks (id, user_id, thread_id) VALUES ('tb1', 'u1', 'th1');");
    assert.throws(
      () => {
        db.exec("INSERT INTO thread_bookmarks (id, user_id, thread_id) VALUES ('tb2', 'u1', 'th1');");
      },
      /constraint/i,
      "Duplicate thread bookmark must violate unique constraint"
    );
  });

  it("should prevent duplicate user mutes (muter_id, muted_user_id)", () => {
    db.exec("INSERT INTO user_mutes (id, muter_id, muted_user_id) VALUES ('um1', 'u1', 'u2');");
    assert.throws(
      () => {
        db.exec("INSERT INTO user_mutes (id, muter_id, muted_user_id) VALUES ('um2', 'u1', 'u2');");
      },
      /constraint/i,
      "Duplicate user mute must violate unique constraint"
    );
  });

  it("should prevent duplicate user onboarding tasks (user_id, task_key)", () => {
    db.exec("INSERT INTO user_onboarding_tasks (id, user_id, task_key) VALUES ('uot1', 'u1', 'profile_bio');");
    assert.throws(
      () => {
        db.exec("INSERT INTO user_onboarding_tasks (id, user_id, task_key) VALUES ('uot2', 'u1', 'profile_bio');");
      },
      /constraint/i,
      "Duplicate onboarding task key for same user must violate unique constraint"
    );
  });

  it("should prevent duplicate conversation participants (conversation_id, user_id)", () => {
    db.exec("INSERT INTO conversation_participants (id, conversation_id, user_id) VALUES ('cp1', 'conv1', 'u1');");
    assert.throws(
      () => {
        db.exec("INSERT INTO conversation_participants (id, conversation_id, user_id) VALUES ('cp2', 'conv1', 'u1');");
      },
      /constraint/i,
      "Duplicate conversation participant must violate unique constraint"
    );
  });
});

describe("Adversarial Schema Testing: Cascade Deletes & Foreign Keys", () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = setupDatabase();
    db.exec(`
      INSERT INTO user (id, name, email) VALUES ('u1', 'Alice', 'alice@example.com');
      INSERT INTO user (id, name, email) VALUES ('u2', 'Bob', 'bob@example.com');
      INSERT INTO communities (id, slug, name) VALUES ('comm1', 'design', 'Design');
      INSERT INTO threads (id, author_id, content, community_id) VALUES ('th1', 'u1', 'Alice Thread', 'comm1');
      INSERT INTO thread_media (id, thread_id, type, url) VALUES ('tm1', 'th1', 'image', 'https://example.com/img.png');
      INSERT INTO thread_link_previews (id, thread_id, url, domain) VALUES ('tlp1', 'th1', 'https://example.com', 'example.com');
      INSERT INTO polls (id, thread_id, question) VALUES ('poll1', 'th1', 'Vote?');
      INSERT INTO poll_options (id, poll_id, option_text, order_index) VALUES ('po1', 'poll1', 'Yes', 0);
      INSERT INTO poll_votes (id, poll_id, poll_option_id, user_id) VALUES ('pv1', 'poll1', 'po1', 'u2');
      INSERT INTO thread_likes (id, user_id, thread_id) VALUES ('tl1', 'u2', 'th1');
      INSERT INTO thread_reposts (id, user_id, thread_id) VALUES ('tr1', 'u2', 'th1');
      INSERT INTO thread_bookmarks (id, user_id, thread_id) VALUES ('tb1', 'u2', 'th1');
      INSERT INTO thread_reports (id, reporter_id, thread_id, reason) VALUES ('rep1', 'u2', 'th1', 'spam');
      INSERT INTO notifications (id, recipient_id, actor_id, type, thread_id) VALUES ('notif1', 'u1', 'u2', 'like', 'th1');
      INSERT INTO user_links (id, user_id, label, url) VALUES ('ul1', 'u1', 'Website', 'https://alice.dev');
      INSERT INTO follows (id, follower_id, following_id) VALUES ('f1', 'u2', 'u1');
      INSERT INTO community_members (id, community_id, user_id) VALUES ('cm1', 'comm1', 'u1');
      INSERT INTO search_history (id, user_id, query, target_user_id) VALUES ('sh1', 'u2', 'alice', 'u1');
      INSERT INTO user_mutes (id, muter_id, muted_user_id) VALUES ('um1', 'u2', 'u1');
      INSERT INTO user_onboarding_tasks (id, user_id, task_key) VALUES ('uot1', 'u1', 'add_avatar');
      INSERT INTO conversations (id, type) VALUES ('conv1', 'direct');
      INSERT INTO conversation_participants (id, conversation_id, user_id) VALUES ('cp1', 'conv1', 'u1');
      INSERT INTO conversation_participants (id, conversation_id, user_id) VALUES ('cp2', 'conv1', 'u2');
      INSERT INTO messages (id, conversation_id, sender_id, content) VALUES ('msg1', 'conv1', 'u1', 'Hi Bob');
    `);
  });

  it("should cascade delete thread attachments when thread is deleted", () => {
    db.exec("DELETE FROM threads WHERE id = 'th1';");

    assert.equal(db.prepare("SELECT count(*) as c FROM thread_media WHERE thread_id = 'th1'").get()?.c, 0);
    assert.equal(db.prepare("SELECT count(*) as c FROM thread_link_previews WHERE thread_id = 'th1'").get()?.c, 0);
    assert.equal(db.prepare("SELECT count(*) as c FROM polls WHERE thread_id = 'th1'").get()?.c, 0);
    assert.equal(db.prepare("SELECT count(*) as c FROM poll_options WHERE poll_id = 'poll1'").get()?.c, 0);
    assert.equal(db.prepare("SELECT count(*) as c FROM poll_votes WHERE poll_id = 'poll1'").get()?.c, 0);
    assert.equal(db.prepare("SELECT count(*) as c FROM thread_likes WHERE thread_id = 'th1'").get()?.c, 0);
    assert.equal(db.prepare("SELECT count(*) as c FROM thread_reposts WHERE thread_id = 'th1'").get()?.c, 0);
    assert.equal(db.prepare("SELECT count(*) as c FROM thread_bookmarks WHERE thread_id = 'th1'").get()?.c, 0);
    assert.equal(db.prepare("SELECT count(*) as c FROM thread_reports WHERE thread_id = 'th1'").get()?.c, 0);
    assert.equal(db.prepare("SELECT count(*) as c FROM notifications WHERE thread_id = 'th1'").get()?.c, 0);
  });

  it("should cascade delete conversation participants and messages when conversation is deleted", () => {
    db.exec("DELETE FROM conversations WHERE id = 'conv1';");

    assert.equal(db.prepare("SELECT count(*) as c FROM conversation_participants WHERE conversation_id = 'conv1'").get()?.c, 0);
    assert.equal(db.prepare("SELECT count(*) as c FROM messages WHERE conversation_id = 'conv1'").get()?.c, 0);
  });

  it("should set null on search_history.target_user_id when target user is deleted", () => {
    db.exec("DELETE FROM user WHERE id = 'u1';");

    const row = db.prepare("SELECT target_user_id FROM search_history WHERE id = 'sh1'").get();
    assert.equal(row?.target_user_id, null, "search_history.target_user_id should be SET NULL when target user is deleted");
  });

  it("should cascade delete community_members and set null on threads.community_id when community is deleted", () => {
    // This tests if deleting community sets null on threads.community_id
    try {
      db.exec("DELETE FROM communities WHERE id = 'comm1';");
      const th = db.prepare("SELECT community_id FROM threads WHERE id = 'th1'").get();
      assert.equal(th?.community_id, null, "community_id should be SET NULL on threads");
      assert.equal(db.prepare("SELECT count(*) as c FROM community_members WHERE community_id = 'comm1'").get()?.c, 0);
    } catch (e: any) {
      assert.fail(`Deleting community failed because foreign key lacks ON DELETE SET NULL: ${e.message}`);
    }
  });

  it("should cascade delete replies when parent thread is deleted", () => {
    db.exec("INSERT INTO threads (id, author_id, content, parent_thread_id, root_thread_id) VALUES ('th_reply', 'u2', 'Reply to Alice', 'th1', 'th1');");

    try {
      db.exec("DELETE FROM threads WHERE id = 'th1';");
      const replies = db.prepare("SELECT id FROM threads WHERE id = 'th_reply'").all();
      assert.equal(replies.length, 0, "Child reply should be cascade deleted when parent thread is deleted");
    } catch (e: any) {
      assert.fail(`Deleting parent thread failed because foreign key lacks ON DELETE CASCADE: ${e.message}`);
    }
  });

  it("should cascade delete all user-related data when user is deleted even if others replied to their threads", () => {
    db.exec("INSERT INTO threads (id, author_id, content, parent_thread_id, root_thread_id) VALUES ('th_reply', 'u2', 'Reply to Alice', 'th1', 'th1');");

    try {
      db.exec("DELETE FROM user WHERE id = 'u1';");
      assert.equal(db.prepare("SELECT count(*) as c FROM threads WHERE author_id = 'u1'").get()?.c, 0);
      assert.equal(db.prepare("SELECT count(*) as c FROM user_links WHERE user_id = 'u1'").get()?.c, 0);
      assert.equal(db.prepare("SELECT count(*) as c FROM follows WHERE following_id = 'u1'").get()?.c, 0);
      assert.equal(db.prepare("SELECT count(*) as c FROM community_members WHERE user_id = 'u1'").get()?.c, 0);
      assert.equal(db.prepare("SELECT count(*) as c FROM user_onboarding_tasks WHERE user_id = 'u1'").get()?.c, 0);
    } catch (e: any) {
      assert.fail(`Deleting user with replied threads failed: ${e.message}`);
    }
  });
});

describe("Adversarial Schema Testing: Nullability & Defaults", () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = setupDatabase();
  });

  it("should permit minimal Better Auth user insertion with correct default values", () => {
    db.exec("INSERT INTO user (id, name, email) VALUES ('u_min', 'Minimal User', 'min@example.com');");

    const row = db.prepare("SELECT * FROM user WHERE id = 'u_min'").get() as any;
    assert.ok(row, "User row should exist");
    assert.equal(row.email_verified, 0, "email_verified should default to 0 (false)");
    assert.equal(row.verified, 0, "verified should default to 0 (false)");
    assert.equal(row.has_follow_badge, 0, "has_follow_badge should default to 0 (false)");
    assert.equal(row.is_private, 0, "is_private should default to 0 (false)");
    assert.equal(row.show_instagram_badge, 0, "show_instagram_badge should default to 0 (false)");
    assert.equal(row.show_recent_views, 0, "show_recent_views should default to 0 (false)");
    assert.equal(row.username, null, "username should default to null");
    assert.equal(row.bio, null, "bio should default to null");
    assert.equal(row.podcast_url, null, "podcast_url should default to null");
    assert.equal(row.interests, null, "interests should default to null");
    assert.equal(row.image, null, "image should default to null");

    // Timestamp verification
    const now = Date.now();
    assert.ok(typeof row.created_at === "number", "created_at should be a number");
    assert.ok(row.created_at > now - 60000 && row.created_at <= now + 60000, `created_at (${row.created_at}) should be near now (${now})`);
  });

  it("should permit minimal thread insertion with correct default values", () => {
    db.exec("INSERT INTO user (id, name, email) VALUES ('u1', 'Author', 'author@example.com');");
    db.exec("INSERT INTO threads (id, author_id, content) VALUES ('th_min', 'u1', 'Minimal content');");

    const row = db.prepare("SELECT * FROM threads WHERE id = 'th_min'").get() as any;
    assert.ok(row, "Thread row should exist");
    assert.equal(row.thread_order, 0, "thread_order should default to 0");
    assert.equal(row.reply_privacy, "anyone", "reply_privacy should default to 'anyone'");
    assert.equal(row.is_draft, 0, "is_draft should default to 0 (false)");
    assert.equal(row.like_count, 0, "like_count should default to 0");
    assert.equal(row.reply_count, 0, "reply_count should default to 0");
    assert.equal(row.repost_count, 0, "repost_count should default to 0");
    assert.equal(row.share_count, 0, "share_count should default to 0");
    assert.equal(row.parent_thread_id, null, "parent_thread_id should be null");
    assert.equal(row.root_thread_id, null, "root_thread_id should be null");
    assert.equal(row.community_id, null, "community_id should be null");
  });

  it("should reject non-null fields when omitted", () => {
    // Missing required content in threads
    db.exec("INSERT INTO user (id, name, email) VALUES ('u1', 'Author', 'author@example.com');");
    assert.throws(
      () => {
        db.exec("INSERT INTO threads (id, author_id) VALUES ('th_fail', 'u1');");
      },
      /constraint/i,
      "Thread content is notNull and must not be omitted"
    );

    // Missing required slug in communities
    assert.throws(
      () => {
        db.exec("INSERT INTO communities (id, name) VALUES ('comm_fail', 'No slug');");
      },
      /constraint/i,
      "Community slug is notNull and must not be omitted"
    );

    // Missing required question in polls
    db.exec("INSERT INTO threads (id, author_id, content) VALUES ('th1', 'u1', 'Post');");
    assert.throws(
      () => {
        db.exec("INSERT INTO polls (id, thread_id) VALUES ('poll_fail', 'th1');");
      },
      /constraint/i,
      "Poll question is notNull and must not be omitted"
    );
  });
});
