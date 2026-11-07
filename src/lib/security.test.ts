import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  escapeSqlLikePattern,
  validateThreadEntries,
  validateReplyContent,
  sanitizeSearchQuery,
  canViewPrivateProfileContent,
  stripSensitivePublicUserFields,
  isSameOriginMutation,
} from "./security.ts";

describe("API Security & Input Validation Seam", () => {
  it("escapes SQL LIKE wildcards (% and _) to prevent wildcard injection", () => {
    assert.equal(escapeSqlLikePattern("100%_real\\user"), "100\\%\\_real\\\\user");
    assert.equal(escapeSqlLikePattern("zerochirou"), "zerochirou");
  });

  it("sanitizes and bounds search queries to 100 characters", () => {
    const longQuery = "  " + "a".repeat(150) + "  ";
    const result = sanitizeSearchQuery(longQuery);
    assert.equal(result.length, 100);
    assert.equal(sanitizeSearchQuery("   "), "");
  });

  it("validates thread entries for emptiness, max count (20), and max length (500 chars)", () => {
    const emptyResult = validateThreadEntries(["   ", ""]);
    assert.equal(emptyResult.valid, false);
    assert.equal(emptyResult.error, "Thread content cannot be empty.");

    const tooLongEntry = validateThreadEntries(["x".repeat(501)]);
    assert.equal(tooLongEntry.valid, false);
    assert.equal(tooLongEntry.error, "Each thread post cannot exceed 500 characters.");

    const tooManyEntries = validateThreadEntries(Array.from({ length: 21 }, () => "hello"));
    assert.equal(tooManyEntries.valid, false);
    assert.equal(tooManyEntries.error, "A thread chain cannot exceed 20 posts.");

    const validEntries = validateThreadEntries(["  First post  ", "", "Second post"]);
    assert.equal(validEntries.valid, true);
    assert.deepEqual(validEntries.entries, ["First post", "Second post"]);
  });

  it("validates reply content for emptiness and max length (500 chars)", () => {
    assert.equal(validateReplyContent("   ").valid, false);
    assert.equal(validateReplyContent("a".repeat(501)).valid, false);
    const valid = validateReplyContent("  Great point! ");
    assert.equal(valid.valid, true);
    assert.equal(valid.content, "Great point!");
  });

  it("enforces private profile visibility only for self or accepted followers", () => {
    assert.equal(
      canViewPrivateProfileContent({ isPrivate: false, isSelf: false, isFollowing: false }),
      true
    );
    assert.equal(
      canViewPrivateProfileContent({ isPrivate: true, isSelf: false, isFollowing: false }),
      false
    );
    assert.equal(
      canViewPrivateProfileContent({ isPrivate: true, isSelf: true, isFollowing: false }),
      true
    );
    assert.equal(
      canViewPrivateProfileContent({ isPrivate: true, isSelf: false, isFollowing: true }),
      true
    );
  });

  it("strips email from public user profile payloads when viewer is not the owner", () => {
    const rawProfile = {
      id: "u_1",
      email: "secret@example.com",
      name: "Zero",
      username: "zero",
      isSelf: false,
    };
    const publicProfile = stripSensitivePublicUserFields(rawProfile, false);
    assert.equal("email" in publicProfile && publicProfile.email !== undefined, false);

    const selfProfile = stripSensitivePublicUserFields({ ...rawProfile, isSelf: true }, true);
    assert.equal(selfProfile.email, "secret@example.com");
  });

  it("validates same-origin headers on state-changing requests when origin is present", () => {
    assert.equal(
      isSameOriginMutation("https://threads.example.com/api/threads", "https://threads.example.com"),
      true
    );
    assert.equal(
      isSameOriginMutation("https://threads.example.com/api/threads", "https://evil.example.com"),
      false
    );
    assert.equal(
      isSameOriginMutation("http://localhost:3000/api/threads", null),
      true
    );
  });
});
