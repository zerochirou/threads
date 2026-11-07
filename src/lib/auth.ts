import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins/username";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

export async function getAuth() {
  const { env } = await getCloudflareContext({ async: true });

  if (!env.DB) {
    throw new Error("D1 database binding 'DB' is not available in Cloudflare context.");
  }

  const db = drizzle(env.DB, { schema });

  const baseURL =
    process.env.BETTER_AUTH_URL ||
    env.BETTER_AUTH_URL ||
    "http://localhost:3000";

  const secret =
    process.env.BETTER_AUTH_SECRET ||
    env.BETTER_AUTH_SECRET;

  const googleClientId =
    process.env.GOOGLE_CLIENT_ID ||
    env.GOOGLE_CLIENT_ID;
  const googleClientSecret =
    process.env.GOOGLE_CLIENT_SECRET ||
    env.GOOGLE_CLIENT_SECRET;

  const githubClientId =
    process.env.GITHUB_CLIENT_ID ||
    env.GITHUB_CLIENT_ID;
  const githubClientSecret =
    process.env.GITHUB_CLIENT_SECRET ||
    env.GITHUB_CLIENT_SECRET;

  const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};

  if (googleClientId && googleClientSecret) {
    socialProviders.google = {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    };
  }

  if (githubClientId && githubClientSecret) {
    socialProviders.github = {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    };
  }

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    secret,
    baseURL,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders,
    account: {
      accountLinking: {
        enabled: true,
      },
    },
    user: {
      additionalFields: {
        bio: {
          type: "string",
          required: false,
          input: true,
        },
        verified: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
        hasFollowBadge: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
        isPrivate: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: true,
        },
        showInstagramBadge: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: true,
        },
        showRecentViews: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: true,
        },
        podcastUrl: {
          type: "string",
          required: false,
          input: true,
        },
        interests: {
          type: "string",
          required: false,
          input: true,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (newUser, ctx) => {
            if (newUser.username && typeof newUser.username === "string" && newUser.username.trim().length >= 3) {
              return { data: newUser };
            }

            const rawPrefix = newUser.email
              ? newUser.email.split("@")[0]
              : newUser.name || "user";
            const sanitized = rawPrefix
              .toLowerCase()
              .replace(/[^a-z0-9_.]/g, "")
              .slice(0, 24);
            const baseCandidate = sanitized.length >= 3 ? sanitized : `user_${sanitized || "member"}`;

            let finalUsername = baseCandidate;
            if (ctx?.context?.adapter) {
              const existing = await ctx.context.adapter.findOne({
                model: "user",
                where: [{ field: "username", value: finalUsername }],
              });
              if (existing) {
                const suffix = Math.random().toString(36).slice(2, 6);
                finalUsername = `${baseCandidate.slice(0, 24)}_${suffix}`;
              }
            }

            return {
              data: {
                ...newUser,
                username: finalUsername,
              },
            };
          },
        },
      },
    },
    trustedOrigins: [
      "http://localhost:3000",
      "http://localhost:8787",
      baseURL,
    ].filter(Boolean) as string[],
    plugins: [
      username({
        displayUsername: false,
        minUsernameLength: 3,
        maxUsernameLength: 30,
      }),
      nextCookies(),
    ],
  });
}

export type Auth = Awaited<ReturnType<typeof getAuth>>;
export type Session = Auth["$Infer"]["Session"];
export type AuthUser = Session["user"];

