import type { AppRouteHandler } from '../../lib/types';
import type { health } from './health.routes';
import env from '@/api/env';
import packageJson from '../../../package.json';

export const getHealthStatus: AppRouteHandler<typeof health> = async (c) => {
  // Track individual service statuses
  const serviceChecks = {
    tmdb: 'ok' as 'ok' | 'fail' | 'degraded',
    logoDev: 'ok' as 'ok' | 'fail' | 'degraded',
    apiCountries: 'ok' as 'ok' | 'fail' | 'degraded',
    kvStore: 'ok' as 'ok' | 'fail' | 'degraded',
  };

  // Check TMDB API
  try {
    const response = await fetch('https://api.themoviedb.org/3/configuration', {
      headers: { Authorization: `Bearer ${env.TMDB_API_KEY}` },
    });
    if (!response.ok) {
      serviceChecks.tmdb = 'degraded';
    }
  }
  catch {
    serviceChecks.tmdb = 'fail';
  }

  // Check Logo.dev API
  try {
    const response = await fetch('https://api.logo.dev/search?q=test', {
      headers: {
        Authorization: `Bearer ${env.LOGO_DEV_API_KEY}`,
      },
    });
    if (!response.ok) {
      serviceChecks.logoDev = 'degraded';
    }
  }
  catch {
    serviceChecks.logoDev = 'fail';
  }

  // Check API Countries
  try {
    const response = await fetch('https://www.apicountries.com/');
    if (!response.ok) {
      serviceChecks.apiCountries = 'degraded';
    }
  }
  catch {
    serviceChecks.apiCountries = 'fail';
  }

  // Check Cloudflare KV store availability
  try {
    await c.env.LOGO_CACHE.list({ limit: 1 });
  }
  catch {
    serviceChecks.kvStore = 'fail';
  }

  // Determine overall status based on all checks
  const hasFailures = Object.values(serviceChecks).includes('fail');
  const hasDegraded = Object.values(serviceChecks).includes('degraded');

  const overallStatus: 'ok' | 'fail' | 'degraded' = hasFailures
    ? 'fail'
    : hasDegraded
      ? 'degraded'
      : 'ok';

  const healthResponse = {
    status: overallStatus,
    version: packageJson.version,
    serviceId: 'guess-logo-api',
    description:
      overallStatus === 'ok'
        ? 'All systems operational'
        : overallStatus === 'degraded'
          ? 'Some services are degraded'
          : 'Critical services are unavailable',
    checks: {
      externalApi: {
        status: overallStatus,
      },
    },
  };

  // Return appropriate status code
  const statusCode = overallStatus === 'ok' ? 200 : 503;

  return c.json(healthResponse, statusCode);
};
