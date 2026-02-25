/* eslint-disable import/first */

// --- Companies ---
// Migrated to database - use /data/stat-items endpoint

// --- Countries ---
// Migrated to database - use /data/stat-items endpoint

// --- Logo Overrides ---
export { default as logoOverrides } from './logo-overrides.json';

// --- Sports (core data) ---
// export { default as leagues } from './sport/leagues.json';
// export { default as allTeams } from './sport/teams.json';

// --- Sports by region ---
import asia from './sport/leagues-by-regions/region-asia.json';
import europe from './sport/leagues-by-regions/region-europe.json';
import northAmerica from './sport/leagues-by-regions/region-north-america.json';
import other from './sport/leagues-by-regions/region-other.json';
import southAmerica from './sport/leagues-by-regions/region-south-america.json';
import summary from './sport/leagues-by-regions/summary.json';

const regionLeagues = {
  asia,
  europe,
  northAmerica,
  southAmerica,
  other,
  summary,
};

export default regionLeagues;
