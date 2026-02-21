import type { InferRequestType } from 'hono/client';

export type ExtractJsonPayload<T> = InferRequestType<T> extends { json?: infer J }
  ? J extends undefined
    ? never
    : J
  : never;
