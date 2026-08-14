import type {
  Fetcher,
  D1Database,
  R2Bucket,
  Ai,
} from "@cloudflare/workers-types";

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  SESSION_SECRET: string;
  AI: Ai;
}

export interface AppBindings {
  Bindings: Env;
}
