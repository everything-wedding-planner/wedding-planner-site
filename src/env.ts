import type { Fetcher, D1Database } from "@cloudflare/workers-types";

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  SESSION_SECRET: string;
}

export interface AppBindings {
  Bindings: Env;
}
