// index.d.ts
declare module '@guess-logo/eslint-config/create-config' {
  const createConfig: (...args: any[]) => Promise<any>;
  export default createConfig;
}
