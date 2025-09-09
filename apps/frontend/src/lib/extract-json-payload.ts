export type ExtractJsonPayload<T> = T extends (args: { json: infer J }, ...rest: any) => any ? J : never;
