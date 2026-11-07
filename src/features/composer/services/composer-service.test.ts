import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  publishThreadRequest,
  publishReplyRequest,
} from "./composer-service.ts";
import type { ThreadPostItem, ThreadReplyItem } from "../../content-scrollbar/types.ts";

describe("Composer Service Seam", () => {
  it("rejects empty thread entries before making a network request", async () => {
    let called = false;
    const fakeFetch: typeof fetch = async () => {
      called = true;
      return new Response("{}", { status: 201 });
    };

    const result = await publishThreadRequest(["  ", ""], fakeFetch);
    assert.equal(called, false);
    assert.equal(result.ok, false);
    assert.equal(result.error, "Thread content cannot be empty.");
  });

  it("publishes valid thread entries and returns created post", async () => {
    const mockPost: ThreadPostItem = {
      id: "post-999",
      author: { username: "zerochirou", fallback: "ZC" },
      timeAgo: "now",
      content: "Hello SWR",
      likeCount: 0,
    };

    const fakeFetch: typeof fetch = async (_input, init) => {
      const body = JSON.parse(String(init?.body));
      assert.deepEqual(body, { threads: ["Hello SWR"] });
      return new Response(JSON.stringify({ post: mockPost }), { status: 201 });
    };

    const result = await publishThreadRequest(["  Hello SWR  "], fakeFetch);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.post.id, "post-999");
    }
  });

  it("publishes valid reply and returns created reply item", async () => {
    const mockReply: ThreadReplyItem = {
      id: "reply-888",
      parentThreadId: "post-999",
      author: { username: "zerochirou", fallback: "ZC" },
      timeAgo: "now",
      content: "Great thread",
      likeCount: 0,
    };

    const fakeFetch: typeof fetch = async (_input, init) => {
      const body = JSON.parse(String(init?.body));
      assert.deepEqual(body, {
        parentThreadId: "post-999",
        content: "Great thread",
      });
      return new Response(JSON.stringify({ reply: mockReply }), { status: 201 });
    };

    const result = await publishReplyRequest(
      { parentThreadId: "post-999", content: "  Great thread " },
      fakeFetch
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.reply.id, "reply-888");
    }
  });
});
