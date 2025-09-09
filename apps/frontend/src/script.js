// file: src/script.js

import fs from 'node:fs';

const leagues = JSON.parse(fs.readFileSync('data/leagues.json', 'utf-8'));

async function fetchTeamsForLeague(leagueId, season) {
  const url = `https://v3.football.api-sports.io/teams?league=${leagueId}&season=${season}`;
  const response = await fetch(url, {
    headers: { 'x-apisports-key': import.meta.env.VITE_ALL_SPORTS_API_KEY },
  });

  if (!response.ok)
    throw new Error(`API error: ${response.status}`);

  const data = await response.json();

  return data.response.map(item => ({
    id: item.team.id,
    code: item.team.code,
    name: item.team.name,
    country: item.team.country,
    national: item.team.national,
    logo: item.team.logo,
    leagueId,
  }));
}

/**
 * Fetch teams for a specific array of league IDs and merge with current saved teams.json
 */
async function fetchTeamsForSpecificLeagues(leagueIds, season) {
  // Load existing teams if the file exists
  let existingTeams = [];
  if (fs.existsSync('data/teams.json')) {
    existingTeams = JSON.parse(fs.readFileSync('data/teams.json', 'utf-8'));
  }

  // Filter leagues from your stored leagues.json
  const selectedLeagues = leagues.filter(l => leagueIds.includes(l.id));

  const newTeams = [];
  for (const l of selectedLeagues) {
    const teams = await fetchTeamsForLeague(l.id, season);
    newTeams.push(...teams);
    console.warn(`Fetched ${teams.length} teams for league: ${l.name}`);
    // Optional delay
    await new Promise(res => setTimeout(res, 500));
  }

  // Merge existing teams with new ones, avoiding duplicates by team id
  const mergedTeamsMap = new Map();
  existingTeams.concat(newTeams).forEach(team => mergedTeamsMap.set(team.id, team));

  const mergedTeams = Array.from(mergedTeamsMap.values());
  fs.writeFileSync('data/teams.json', JSON.stringify(mergedTeams, null, 2));
  console.warn(`Merged and saved total ${mergedTeams.length} teams`);
}

// Example usage: fetch teams only for leagues with IDs 307, 308, and 309
fetchTeamsForSpecificLeagues([307, 308, 309], 2023).catch(console.error);
