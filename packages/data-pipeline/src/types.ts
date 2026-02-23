export interface StatItemInput {
  entityType: string;
  externalId?: string;
  category: string;
  name: string;
  metricType: string;
  value: number;
  unit: string;
  imageKey?: string;
  imageUrl?: string;
  hint?: string;
  source: string;
}

export interface StatItemTransformer<TRaw> {
  source: string;
  category: string;
  fetch: () => Promise<TRaw[]>;
  transform: (raw: TRaw) => StatItemInput[];
}

export interface SyncResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  duration: number;
}
