export const MAX_THREAD_POST_LENGTH = 500;
export const MAX_THREAD_CHAIN_LENGTH = 20;
export const MAX_SEARCH_QUERY_LENGTH = 100;

export function escapeSqlLikePattern(raw: string): string {
  return raw.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export function sanitizeSearchQuery(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.trim().slice(0, MAX_SEARCH_QUERY_LENGTH);
}

export function validateThreadEntries(
  rawEntries: unknown
): { valid: true; entries: string[] } | { valid: false; error: string } {
  const list = Array.isArray(rawEntries)
    ? rawEntries.filter((item): item is string => typeof item === "string")
    : typeof rawEntries === "string"
      ? [rawEntries]
      : [];

  const entries = list.map((item) => item.trim()).filter(Boolean);

  if (entries.length === 0) {
    return { valid: false, error: "Thread content cannot be empty." };
  }

  if (entries.length > MAX_THREAD_CHAIN_LENGTH) {
    return {
      valid: false,
      error: `A thread chain cannot exceed ${MAX_THREAD_CHAIN_LENGTH} posts.`,
    };
  }

  for (const entry of entries) {
    if (entry.length > MAX_THREAD_POST_LENGTH) {
      return {
        valid: false,
        error: `Each thread post cannot exceed ${MAX_THREAD_POST_LENGTH} characters.`,
      };
    }
  }

  return { valid: true, entries };
}

export function validateReplyContent(
  rawContent: unknown
): { valid: true; content: string } | { valid: false; error: string } {
  if (typeof rawContent !== "string") {
    return { valid: false, error: "Comment content cannot be empty." };
  }

  const content = rawContent.trim();
  if (!content) {
    return { valid: false, error: "Comment content cannot be empty." };
  }

  if (content.length > MAX_THREAD_POST_LENGTH) {
    return {
      valid: false,
      error: `Comment content cannot exceed ${MAX_THREAD_POST_LENGTH} characters.`,
    };
  }

  return { valid: true, content };
}

export function canViewPrivateProfileContent(params: {
  isPrivate: boolean;
  isSelf: boolean;
  isFollowing: boolean;
}): boolean {
  if (!params.isPrivate) return true;
  return params.isSelf || params.isFollowing;
}

export function stripSensitivePublicUserFields<
  T extends { email?: string; isSelf?: boolean }
>(user: T, isSelf: boolean): Omit<T, "email"> & { email?: string } {
  if (isSelf) {
    return user;
  }
  const rest = { ...user };
  delete rest.email;
  return rest;
}

export function isSameOriginMutation(
  requestUrl: string,
  originHeader: string | null | undefined
): boolean {
  if (!originHeader) return true;
  try {
    const reqOrigin = new URL(requestUrl).origin;
    const headerOrigin = new URL(originHeader).origin;
    return reqOrigin === headerOrigin;
  } catch {
    return false;
  }
}
