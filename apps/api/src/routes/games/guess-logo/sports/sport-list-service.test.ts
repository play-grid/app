import type { RawLeague, RawTeam, SportRegionId } from '@guess-logo/shared/types';
import { loadRegion } from '@guess-logo/shared/data/load-region';
import { SPORT_REGIONS } from '@guess-logo/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getAllSportLists,
  getAllSportTeams,
  getAllTeamsInRegion,
  getLeaguesInRegion,
  getSportLists,
  getSportRegions,
  getTeamsInLeague,
} from './sport-list-service';

// Mock dependencies
vi.mock('@guess-logo/shared/data/load-region', () => ({
  loadRegion: vi.fn(),
}));

vi.mock('@guess-logo/shared/types', async (importOriginal) => {
  const original = await importOriginal<typeof import('@guess-logo/shared/types')>();
  return {
    ...original,
    SPORT_REGIONS: [
      { id: 'asia', name: { en: 'Asia', ar: 'آسيا' } },
      { id: 'europe', name: { en: 'Europe', ar: 'أوروبا' } },
    ],
    SPORT_REGION_IDS: ['asia', 'europe'],
  };
});

// Mock Data
const mockTeamsAsia: RawTeam[] = [
  { id: 1, name: 'Al-Hilal', leagueId: 101, logo: 'logo1.png' },
  { id: 2, name: 'Al-Nassr', leagueId: 101, logo: 'logo2.png' },
];

const mockLeaguesAsia: RawLeague[] = [
  { id: 101, name: 'Saudi Pro League', teams: mockTeamsAsia },
];

const mockTeamsEurope: RawTeam[] = [
  { id: 3, name: 'Real Madrid', leagueId: 201, logo: 'logo3.png' },
  { id: 4, name: 'Barcelona', leagueId: 201, logo: 'logo4.png' },
];

const mockLeaguesEurope: RawLeague[] = [
  { id: 201, name: 'La Liga', teams: mockTeamsEurope },
];

describe('sport List Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (loadRegion as vi.Mock).mockImplementation((regionId: SportRegionId) => {
      if (regionId === 'asia') {
        return Promise.resolve(mockLeaguesAsia);
      }
      if (regionId === 'europe') {
        return Promise.resolve(mockLeaguesEurope);
      }
      return Promise.resolve([]);
    });
  });

  describe('getSportRegions', () => {
    it('should return the list of supported sport regions', () => {
      const regions = getSportRegions();
      expect(regions).toEqual(SPORT_REGIONS);
      expect(regions.length).toBe(2);
    });
  });

  describe('getLeaguesInRegion', () => {
    it('should return leagues for a specific region', async () => {
      const leagues = await getLeaguesInRegion('asia');
      expect(loadRegion).toHaveBeenCalledWith('asia');
      expect(leagues).toHaveLength(1);
      expect(leagues[0].id).toBe('101');
      expect(leagues[0].name.en).toBe('Saudi Pro League');
    });

    it('fetchItems should return teams for a league', async () => {
      const leagues = await getLeaguesInRegion('asia');
      const teams = await leagues[0].fetchItems('en');
      expect(teams).toHaveLength(2);
      expect(teams[0].name).toBe('Al-Hilal');
    });
  });

  describe('getTeamsInLeague', () => {
    it('should return teams for a specific league in a region', async () => {
      const teams = await getTeamsInLeague('asia', '101');
      expect(loadRegion).toHaveBeenCalledWith('asia');
      expect(teams).toHaveLength(2);
      expect(teams[0].id).toBe('1');
    });

    it('should throw an error for a non-existent league', async () => {
      await expect(getTeamsInLeague('asia', '999')).rejects.toThrow(
        'League 999 not found in region asia',
      );
    });
  });

  describe('getAllTeamsInRegion', () => {
    it('should return all teams combined for a given region', async () => {
      const teams = await getAllTeamsInRegion('asia');
      expect(loadRegion).toHaveBeenCalledWith('asia');
      expect(teams).toHaveLength(2);
      expect(teams.map(t => t.name)).toEqual(['Al-Hilal', 'Al-Nassr']);
    });
  });

  describe('getAllSportTeams', () => {
    it('should return all teams from all regions', async () => {
      const teams = await getAllSportTeams();
      expect(loadRegion).toHaveBeenCalledWith('asia');
      expect(loadRegion).toHaveBeenCalledWith('europe');
      expect(teams).toHaveLength(4);
      expect(teams.map(t => t.name)).toEqual(['Al-Hilal', 'Al-Nassr', 'Real Madrid', 'Barcelona']);
    });
  });

  describe('getSportLists', () => {
    it('should be an alias for getLeaguesInRegion', async () => {
      const leagues = await getSportLists('europe');
      expect(loadRegion).toHaveBeenCalledWith('europe');
      expect(leagues).toHaveLength(1);
      expect(leagues[0].id).toBe('201');
      expect(leagues[0].name.en).toBe('La Liga');
    });
  });

  describe('getAllSportLists', () => {
    it('should return all leagues from all regions', async () => {
      const allLists = await getAllSportLists();
      expect(loadRegion).toHaveBeenCalledWith('asia');
      expect(loadRegion).toHaveBeenCalledWith('europe');
      expect(allLists).toHaveLength(2);
      const names = allLists.map(l => l.name.en);
      expect(names).toContain('Saudi Pro League');
      expect(names).toContain('La Liga');
    });
  });
});
