import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
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
    trustedOrigins: [
      "http://localhost:3000",
      "http://localhost:8787",
      baseURL,
    ].filter(Boolean) as string[],
    plugins: [nextCookies()],
  });
}
