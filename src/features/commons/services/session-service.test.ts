import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isMobileNavRouteActive,
  resolveMobileBottomNavItems,
} from "./session-service.ts";

describe("Commons Navigation & Session Service Seam", () => {
  it("resolves 5 mobile bottom navigation items matching Threads mobile bar", () => {
    const items = resolveMobileBottomNavItems();
    assert.equal(items.length, 5);
    assert.deepEqual(
      items.map((item) => item.id),
      ["home", "search", "compose", "liked", "profile"]
    );
  });

  it("matches active route state accurately for mobile bottom navigation", () => {
    assert.equal(isMobileNavRouteActive("/", "/"), true);
    assert.equal(isMobileNavRouteActive("/search", "/"), false);
    assert.equal(isMobileNavRouteActive("/search", "/search"), true);
    assert.equal(isMobileNavRouteActive("/liked", "/liked"), true);
    assert.equal(isMobileNavRouteActive("/saved", "/liked"), true);
    assert.equal(isMobileNavRouteActive("/profile", "/profile"), true);
    assert.equal(isMobileNavRouteActive("/profile/zerochirou", "/profile"), true);
  });
});
