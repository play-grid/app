// index.d.ts
declare module '@dna/eslint-config/create-config' {
  const createConfig: (...args: any[]) => Promise<any>;
  export default createConfig;
}
