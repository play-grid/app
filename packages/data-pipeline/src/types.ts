import type { StatItemInput } from './schemas';

export { StatItemInput } from './schemas';

export interface StatItemTransformer<TRaw> {
  source: string;
  category: string;
  fetch: () => Promise<TRaw[]>;
  transform: (raw: TRaw) => StatItemInput[] | Promise<StatItemInput[]>;
}

export interface SyncResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  duration: number;
}
