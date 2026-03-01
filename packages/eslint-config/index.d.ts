// index.d.ts
declare module '@playgrid/eslint-config/create-config' {
  const createConfig: (...args: any[]) => Promise<any>;
  export default createConfig;
}
