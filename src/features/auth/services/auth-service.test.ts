import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeSignUpUsername, isEmailIdentifier } from "./auth-service.ts";

describe("Auth Service Seam", () => {
  it("normalizes signup usernames and strips invalid symbols", () => {
    assert.equal(normalizeSignUpUsername("  @Zero_Chirou!# "), "zero_chirou");
  });

  it("identifies email vs username sign-in identifiers", () => {
    assert.equal(isEmailIdentifier("zero@example.com"), true);
    assert.equal(isEmailIdentifier("zerochirou"), false);
  });
});
