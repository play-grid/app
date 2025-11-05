import { Module } from 'node:module';

const originalRequire = Module.prototype.require;
Module.prototype.require = function (id: string) {
  if (id.startsWith('cloudflare:')) {
    // Return fake implementations for Cloudflare builtin exports
    return {
      // Common classes used internally by hono/cloudflare
      DurableObject: class {},
      DurableObjectNamespace: class {},
      Request: globalThis.Request,
      Response: globalThis.Response,
      fetch: globalThis.fetch,
      ExecutionContext: class {},
      // Add anything else you see in stack traces if needed
    };
  }
  // eslint-disable-next-line prefer-rest-params
  return originalRequire.apply(this, arguments as any);
};
