import type { SportRegionId } from '../../types/sport';

// Lazy loader with strict typing
export async function loadRegion(region: SportRegionId): Promise<any[]> {
  switch (region) {
    case 'africa':
      return (await import('./leagues-by-regions/region-africa.json')).default;
    case 'asia':
      return (await import('./leagues-by-regions/region-asia.json')).default;
    case 'europe':
      return (await import('./leagues-by-regions/region-europe.json')).default;
    case 'north-america':
      return (await import('./leagues-by-regions/region-north-america.json')).default;
    case 'south-america':
      return (await import('./leagues-by-regions/region-south-america.json')).default;
    case 'oceania':
      return (await import('./leagues-by-regions/region-oceania.json')).default;
    case 'other':
      return (await import('./leagues-by-regions/region-other.json')).default;
  }
}
