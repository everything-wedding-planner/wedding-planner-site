import type { Fetcher, D1Database, R2Bucket } from "@cloudflare/workers-types";

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  SESSION_SECRET: string;
}

export interface AppBindings {
  Bindings: Env;
}
