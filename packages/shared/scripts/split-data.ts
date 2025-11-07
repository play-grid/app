import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { leagues } from '../data';
import teams from '../data/sport/teams.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_OUTPUT_DIR = path.resolve(__dirname, '../data/split');
const LEAGUES_DIR = path.join(ROOT_OUTPUT_DIR, 'leagues');
const TEAMS_DIR = path.join(ROOT_OUTPUT_DIR, 'teams');

// --- Utility ---
function ensureCleanDir(dir: string) {
  if (fs.existsSync(dir))
    fs.rmSync(dir, { recursive: true });
  fs.mkdirSync(dir, { recursive: true });
}

// --- Prepare fresh directories ---
ensureCleanDir(ROOT_OUTPUT_DIR);
ensureCleanDir(LEAGUES_DIR);
ensureCleanDir(TEAMS_DIR);

// --- 1. Split leagues by region ---
function leaguesByRegion() {
  const regionMap: Record<string, typeof leagues> = {};

  for (const league of leagues) {
    const region = league.country?.trim() || 'Other';
    (regionMap[region] ??= []).push(league);
  }

  return regionMap;
}

function splitLeaguesByRegion() {
  const regionMap = leaguesByRegion();

  for (const [region, leaguesInRegion] of Object.entries(regionMap)) {
    const filePath = path.join(LEAGUES_DIR, `leagues-${region.toLowerCase().replace(/\s+/g, '_')}.json`);
    fs.writeFileSync(filePath, JSON.stringify(leaguesInRegion, null, 2));
    console.log(`✅ Wrote ${leaguesInRegion.length} leagues → ${filePath}`);
  }
}

// --- 2. Split teams by league ---
function teamsByLeague() {
  const leagueMap: Record<number, typeof teams> = {};

  for (const team of teams) {
    (leagueMap[team.leagueId] ??= []).push(team);
  }

  return leagueMap;
}

function splitTeamsByLeague() {
  const leagueMap = teamsByLeague();

  for (const [leagueId, teamsInLeague] of Object.entries(leagueMap)) {
    const filePath = path.join(TEAMS_DIR, `teams-league-${leagueId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(teamsInLeague, null, 2));
    console.log(`✅ Wrote ${teamsInLeague.length} teams → ${filePath}`);
  }
}

// --- Run both processes ---
splitLeaguesByRegion();
splitTeamsByLeague();

console.log('\n✨ Split complete! Data organized under packages/shared/data/split/');
