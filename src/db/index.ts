import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });

  if (!env.DB) {
    throw new Error("D1 database binding 'DB' is not available in Cloudflare context.");
  }

  return drizzle(env.DB, { schema });
}

export { schema };
export type Database = Awaited<ReturnType<typeof getDb>>;
