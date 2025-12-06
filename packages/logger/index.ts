import type { LoggerOptions, TransportSingleOptions } from 'pino';
import process from 'node:process';
import pino from 'pino';
import pretty from 'pino-pretty';

export interface CreateBaseLoggerOptions {
  level?: string;
  pinoOptions?: LoggerOptions;
  transport?: TransportSingleOptions | null;
  isProdOverride?: boolean;
}

export function createBaseLogger(
  pkgName: string,
  options: CreateBaseLoggerOptions = {},
) {
  const {
    level: explicitLevel,
    pinoOptions = {},
    transport: explicitTransport,
    isProdOverride,
  } = options;

  const envVar = `${pkgName.toUpperCase().replace(/-/g, '_')}_LOG_LEVEL`;

  const level
    = explicitLevel
      || process.env[envVar]
      || process.env.LOG_LEVEL
      || 'info';

  const isProd
    = typeof isProdOverride === 'boolean'
      ? isProdOverride
      : process.env.NODE_ENV === 'production';

  const defaultTransport: TransportSingleOptions | null = isProd
    ? null
    : {
        target: 'pino-pretty',
        options: {
          ...pretty(),
        },
      };

  const transport
    = explicitTransport === undefined ? defaultTransport : explicitTransport;

  const transportOption = transport === null ? undefined : transport as TransportSingleOptions;

  return pino(
    {
      level,
      base: {
        ...(pinoOptions.base || {}),
        pkg: pkgName,
      },
      ...pinoOptions,
      transport: transportOption,
    },

  );
}
