import { defineConfig } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";

function getLocalD1DB(): string | undefined {
  try {
    const basePath = path.resolve(".wrangler/state/v3/d1/miniflare-D1DatabaseObject");
    if (!fs.existsSync(basePath)) return undefined;
    const files = fs
      .readdirSync(basePath)
      .filter((file) => file.endsWith(".sqlite") && file !== "metadata.sqlite");

    if (files.length === 0) return undefined;
    // Ambil file sqlite database yang paling baru
    files.sort((a, b) => {
      const statA = fs.statSync(path.join(basePath, a));
      const statB = fs.statSync(path.join(basePath, b));
      return statB.mtimeMs - statA.mtimeMs;
    });

    return path.join(basePath, files[0]);
  } catch {
    return undefined;
  }
}

const localDbUrl = getLocalD1DB();

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  ...(localDbUrl
    ? {
        dbCredentials: {
          url: localDbUrl,
        },
      }
    : {}),
});
