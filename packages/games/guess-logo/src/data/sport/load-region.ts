import type { SportRegionId } from '@playgrid/shared/types';

// Lazy loader with strict typing
export async function loadRegion(region: SportRegionId): Promise<any[]> {
  switch (region) {
    case 'asia':
      return (await import('./leagues-by-regions/region-asia.json')).default;
    case 'europe':
      return (await import('./leagues-by-regions/region-europe.json')).default;
    case 'north-america':
      return (await import('./leagues-by-regions/region-north-america.json')).default;
    case 'south-america':
      return (await import('./leagues-by-regions/region-south-america.json')).default;
    case 'other':
      return (await import('./leagues-by-regions/region-other.json')).default;
  }
}
