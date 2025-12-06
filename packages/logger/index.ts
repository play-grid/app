import process from 'node:process';
import pino from 'pino';
import pretty from 'pino-pretty';

export function createBaseLogger(pkgName: string) {
  const overrideVar = `${pkgName.toUpperCase().replace(/-/g, '_')}_LOG_LEVEL`;

  const level
    = process.env[overrideVar]
      || process.env.LOG_LEVEL
      || 'info';

  const isProd = process.env.NODE_ENV === 'production';

  return pino(
    { level },
    isProd ? undefined : pretty(),
  );
}
