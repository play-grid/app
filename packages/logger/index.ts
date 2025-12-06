/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable ts/no-require-imports */
/* eslint-disable node/prefer-global/process */
/* eslint-disable no-console */
export interface CreateBaseLoggerOptions {
  level?: string;
  isProdOverride?: boolean;
}

export interface BaseLogger {
  fatal: (message: unknown, ...meta: any[]) => void;
  error: (message: unknown, ...meta: any[]) => void;
  warn: (message: unknown, ...meta: any[]) => void;
  info: (message: unknown, ...meta: any[]) => void;
  debug: (message: unknown, ...meta: any[]) => void;
  trace: (message: unknown, ...meta: any[]) => void;
  child: (bindings: Record<string, any>) => BaseLogger;
  level: string;
}

export function createBaseLogger(
  pkgName: string,
  options: CreateBaseLoggerOptions = {},
): BaseLogger {
  const isNode = typeof process !== 'undefined' && process.versions?.node;

  if (isNode) {
    try {
      return _createNodeLogger(pkgName, options);
    }
    catch (_error) {
      return _createConsoleLogger(pkgName, options);
    }
  }

  return _createConsoleLogger(pkgName, options);
}

function _createNodeLogger(
  pkgName: string,
  options: CreateBaseLoggerOptions,
): BaseLogger {
  const process = require('node:process');

  const pino = require('pino');

  const pretty = require('pino-pretty');

  const {
    level: explicitLevel,
    isProdOverride,
  } = options;

  const envVar = `${pkgName.toUpperCase().replace(/-/g, '_')}_LOG_LEVEL`;

  const level: string
    = explicitLevel
      || (process.env[envVar] as string)
      || (process.env.LOG_LEVEL as string)
      || 'info';

  const isProd: boolean
    = typeof isProdOverride === 'boolean'
      ? isProdOverride
      : process.env.NODE_ENV === 'production';

  const transport = isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: pretty({
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        }),
      };

  const pinoLogger = pino(
    {
      level,
      base: { pkg: pkgName },
      transport,
    },
  );

  return {
    fatal: (message: unknown, ...meta: any[]) => {
      pinoLogger.fatal(typeof message === 'string' ? { msg: message, meta } : message);
    },
    error: (message: unknown, ...meta: any[]) => {
      pinoLogger.error(typeof message === 'string' ? { msg: message, meta } : message);
    },
    warn: (message: unknown, ...meta: any[]) => {
      pinoLogger.warn(typeof message === 'string' ? { msg: message, meta } : message);
    },
    info: (message: unknown, ...meta: any[]) => {
      pinoLogger.info(typeof message === 'string' ? { msg: message, meta } : message);
    },
    debug: (message: unknown, ...meta: any[]) => {
      pinoLogger.debug(typeof message === 'string' ? { msg: message, meta } : message);
    },
    trace: (message: unknown, ...meta: any[]) => {
      pinoLogger.trace(typeof message === 'string' ? { msg: message, meta } : message);
    },
    child: (bindings: Record<string, any>) => {
      const childPinoLogger = pinoLogger.child(bindings);
      return {
        fatal: (message: unknown, ...meta: any[]) => {
          childPinoLogger.fatal(typeof message === 'string' ? { msg: message, meta } : message);
        },
        error: (message: unknown, ...meta: any[]) => {
          childPinoLogger.error(typeof message === 'string' ? { msg: message, meta } : message);
        },
        warn: (message: unknown, ...meta: any[]) => {
          childPinoLogger.warn(typeof message === 'string' ? { msg: message, meta } : message);
        },
        info: (message: unknown, ...meta: any[]) => {
          childPinoLogger.info(typeof message === 'string' ? { msg: message, meta } : message);
        },
        debug: (message: unknown, ...meta: any[]) => {
          childPinoLogger.debug(typeof message === 'string' ? { msg: message, meta } : message);
        },
        trace: (message: unknown, ...meta: any[]) => {
          childPinoLogger.trace(typeof message === 'string' ? { msg: message, meta } : message);
        },
        child: (childBindings: Record<string, any>) => {
          const grandchildPinoLogger = childPinoLogger.child(childBindings);
          return {
            fatal: (message: unknown, ...meta: any[]) => {
              grandchildPinoLogger.fatal(typeof message === 'string' ? { msg: message, meta } : message);
            },
            error: (message: unknown, ...meta: any[]) => {
              grandchildPinoLogger.error(typeof message === 'string' ? { msg: message, meta } : message);
            },
            warn: (message: unknown, ...meta: any[]) => {
              grandchildPinoLogger.warn(typeof message === 'string' ? { msg: message, meta } : message);
            },
            info: (message: unknown, ...meta: any[]) => {
              grandchildPinoLogger.info(typeof message === 'string' ? { msg: message, meta } : message);
            },
            debug: (message: unknown, ...meta: any[]) => {
              grandchildPinoLogger.debug(typeof message === 'string' ? { msg: message, meta } : message);
            },
            trace: (message: unknown, ...meta: any[]) => {
              grandchildPinoLogger.trace(typeof message === 'string' ? { msg: message, meta } : message);
            },
            child: () => _createConsoleLogger(pkgName, options),
            level,
          };
        },
        level,
      };
    },
    level,
  };
}

function _createConsoleLogger(
  pkgName: string,
  _options: CreateBaseLoggerOptions,
): BaseLogger {
  const logLevel = _options.level || 'info';
  const minLevel = getLevelValue(logLevel);

  function getLevelValue(level: string): number {
    const levels: Record<string, number> = {
      fatal: 60,
      error: 50,
      warn: 40,
      info: 30,
      debug: 20,
      trace: 10,
      silent: 0,
    };
    return levels[level] ?? 30;
  }

  function logWithLevel(level: number, message: unknown, meta: any[]) {
    if (level < minLevel)
      return;

    const output = typeof message === 'object' && message !== null
      ? [message]
      : typeof message === 'string'
        ? meta.length > 0
          ? [message, meta]
          : [message]
        : [String(message)];

    if (level >= 50) {
      console.error(`[${pkgName}]`, ...output);
    }
    else if (level >= 40) {
      console.warn(`[${pkgName}]`, ...output);
    }
    else {
      console.info(`[${pkgName}]`, ...output);
    }
  }

  function createChildLogger(bindings: Record<string, any>): BaseLogger {
    const childPkg = bindings.pkg || pkgName;
    return _createConsoleLogger(childPkg, _options);
  }

  return {
    fatal: (message: unknown, ...meta: any[]) => logWithLevel(60, message, meta),
    error: (message: unknown, ...meta: any[]) => logWithLevel(50, message, meta),
    warn: (message: unknown, ...meta: any[]) => logWithLevel(40, message, meta),
    info: (message: unknown, ...meta: any[]) => logWithLevel(30, message, meta),
    debug: (message: unknown, ...meta: any[]) => logWithLevel(20, message, meta),
    trace: (message: unknown, ...meta: any[]) => logWithLevel(10, message, meta),
    child: createChildLogger,
    level: logLevel,
  };
}
