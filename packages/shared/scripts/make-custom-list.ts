import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { REGION_MAP } from './region-map';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.join(__dirname, '../data/sport');

// 🗺️ Optional custom multi-country groups
const REGION_GROUPS: Record<string, string[]> = {
  'middle-east': [
    'saudi arabia',
    'united arab emirates',
    'qatar',
    'bahrain',
    'kuwait',
    'oman',
    'jordan',
    'lebanon',
    'iraq',
    'syria',
    'palestine',
    'yemen',
  ],
};

// 🧩 Parse CLI args
const args = process.argv.slice(2);
const argMap = Object.fromEntries(
  args.map((arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    return [key, value];
  }),
);

const regionArg = argMap.region?.toLowerCase();
const countryArg = argMap.country?.toLowerCase();
const groupArg = argMap.group?.toLowerCase();

if (!regionArg && !countryArg && !groupArg) {
  console.error('❌ Please pass --region, --country, or --group');
  process.exit(1);
}

// 📦 Load data
const regionsDir = path.join(ROOT, 'leagues-by-regions');
const regionFiles = fs.readdirSync(regionsDir).filter(f => f.endsWith('.json'));
const teams = JSON.parse(fs.readFileSync(path.join(ROOT, 'teams.json'), 'utf8'));

const allLeagues: any[] = [];
for (const file of regionFiles) {
  if (file === 'summary.json')
    continue;
  const data = JSON.parse(fs.readFileSync(path.join(regionsDir, file), 'utf8'));
  allLeagues.push(...data);
}

// 🧠 Normalize helper
function normalize(str: string) {
  return str.toLowerCase().replace(/\s+/g, ' ').trim();
}

// 🔗 Merge teams into leagues
const leaguesWithTeams = allLeagues.map(league => ({
  ...league,
  teams: teams.filter(t => t.leagueId === league.id),
}));

let filtered: any[] = [];

// 🧭 1. Filter by region name
if (regionArg) {
  const normalizedRegion = normalize(regionArg);

  filtered = leaguesWithTeams.filter((league) => {
    const countryKey = normalize(league.country);
    const mappedRegion = REGION_MAP[countryKey];
    return mappedRegion === normalizedRegion;
  });
}

// 🇸🇦 2. Filter by country name
if (countryArg) {
  const normalizedCountry = normalize(countryArg);
  filtered = leaguesWithTeams.filter(
    league => normalize(league.country) === normalizedCountry,
  );
}

// 🌍 3. Filter by multi-country group
if (groupArg) {
  const countries = REGION_GROUPS[groupArg];
  if (!countries) {
    console.error(`❌ Unknown group: ${groupArg}`);
    process.exit(1);
  }
  const normalizedCountries = countries.map(normalize);
  filtered = leaguesWithTeams.filter(l =>
    normalizedCountries.includes(normalize(l.country)),
  );
}

// 📝 Write result
const outDir = path.join(ROOT, 'custom-lists');
fs.mkdirSync(outDir, { recursive: true });

const fileBase
  = regionArg || countryArg || groupArg || 'custom';
const outFile = path.join(outDir, `${fileBase}.json`);

fs.writeFileSync(outFile, JSON.stringify(filtered, null, 2));
console.log(`✅ Created ${fileBase}.json with ${filtered.length} leagues`);
