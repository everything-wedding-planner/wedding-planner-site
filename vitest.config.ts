import path from "node:path";
import {
  cloudflareTest,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig(async () => {
  const migrationsPath = path.join(__dirname, "database", "migrations");
  const migrations = await readD1Migrations(migrationsPath);

  return {
    plugins: [
      cloudflareTest({
        wrangler: {
          configPath: "./wrangler.jsonc",
        },
        miniflare: {
          bindings: {
            SESSION_SECRET: "test-secret-key-at-least-32-chars-long",
            TEST_MIGRATIONS: migrations,
          },
        },
      }),
    ],
    test: {
      setupFiles: ["./src/test/setup.ts"],
      exclude: ["frontend/**", "node_modules/**", ".opencode/**"],
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          bindings: {
            SESSION_SECRET: "test-secret-key-at-least-32-chars-long",
            TEST_MIGRATIONS: migrations,
          },
        },
      },
    },
  };
});
