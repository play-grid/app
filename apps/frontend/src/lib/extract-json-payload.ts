export type ExtractJsonPayload<T>
  = T extends (args: infer Args, ...rest: any) => any
    ? Args extends { json: infer J }
      ? J
      : never
    : T extends { $post: { input: infer I } }
      ? I extends { json: infer J }
        ? J
        : never
      : T extends { input: { json: infer J } }
        ? J
        : never;
