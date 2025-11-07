/* eslint-disable import/first */

// --- Companies ---
export { default as companies } from './companies/companies.json';
export { default as saudiCompanies } from './companies/saudi-companies.json';

// --- Countries ---
export { default as regionOverrides } from './countries/region-overrides.json';
export { default as topGdpCountryNamesAr } from './countries/top-gdp-country-names-ar.json';
export { default as topGdpCountryNames } from './countries/top-gdp-country-names.json';

// --- Logo Overrides ---
export { default as logoOverrides } from './logo-overrides.json';

// --- Sports (core data) ---
// export { default as leagues } from './sport/leagues.json';
// export { default as allTeams } from './sport/teams.json';

// --- Sports by region ---
import africa from './sport/leagues-by-regions/region-africa.json';
import asia from './sport/leagues-by-regions/region-asia.json';
import europe from './sport/leagues-by-regions/region-europe.json';
import northAmerica from './sport/leagues-by-regions/region-north-america.json';
import oceania from './sport/leagues-by-regions/region-oceania.json';
import other from './sport/leagues-by-regions/region-other.json';
import southAmerica from './sport/leagues-by-regions/region-south-america.json';
import summary from './sport/leagues-by-regions/summary.json';

const regionLeagues = {
  africa,
  asia,
  europe,
  northAmerica,
  southAmerica,
  oceania,
  other,
  summary,
};

export default regionLeagues;
