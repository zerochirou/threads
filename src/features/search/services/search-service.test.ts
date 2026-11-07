import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  searchKeys,
  applyOptimisticFollowToSearchUsers,
} from "./search-service.ts";
import type { SearchUserItem } from "../types.ts";

const sampleUsers: SearchUserItem[] = [
  {
    id: "u-21",
    username: "zerochirou",
    fullName: "Zero Chirou",
    fallback: "ZC",
    isFollowing: false,
  },
  {
    id: "u-22",
    username: "miqdad",
    fullName: "Miqdad",
    fallback: "MI",
    isFollowing: true,
  },
];

describe("Search Service Seam", () => {
  it("builds normalized SWR search keys with query sanitization", () => {
    assert.equal(searchKeys.query(""), "/api/users/search");
    assert.equal(searchKeys.query("   "), "/api/users/search");
    assert.equal(
      searchKeys.query("  zero chirou  "),
      "/api/users/search?q=zero%20chirou"
    );
  });

  it("applies optimistic follow toggle and server reconciliation to search user items", () => {
    const toggled = applyOptimisticFollowToSearchUsers(sampleUsers, "u-21");
    assert.equal(toggled[0].isFollowing, true);

    const reconciled = applyOptimisticFollowToSearchUsers(
      sampleUsers,
      "u-22",
      false
    );
    assert.equal(reconciled[1].isFollowing, false);
  });
});
