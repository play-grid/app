import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --- TYPES ---
interface Team {
  id: number;
  name: string;
  logo: string;
  leagueId: number;
  [key: string]: any;
}

interface League {
  id: number;
  name: string;
  teams: Team[];
}

interface OutputTeam {
  id: number;
  name: string;
  logo: string;
  leagueId: number;
}

interface RawLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
  teams: OutputTeam[];
}

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataRoot = path.join(__dirname, '../data/sport');

const teamNamesInputFile = path.join(dataRoot, 'custom-lists', 'top-teams.json');
const dataDir = path.join(dataRoot, 'leagues-by-regions');
const outputDir = path.join(dataRoot, 'custom-lists');
const outputFileName = 'top-teams-list.json';

const VIRTUAL_LEAGUE_ID = 9001; // A high number to avoid collisions

/**
 * Normalizes a string for better matching.
 * - Converts to lowercase
 * - Removes accents/diacritics (e.g., "München" -> "munchen")
 * - Replaces non-alphanumeric characters with spaces
 * - Collapses multiple spaces into one
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD') // Decompose combined graphemes
    .replace(/[\u0300-\u036F]/g, '') // Remove diacritical marks
    .replace(/[^a-z0-9\s]/g, ' ') // Replace non-alphanumeric with space
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

// --- SCRIPT LOGIC ---
async function createTopTeamsList() {
  try {
    console.log('🚀 Starting script to create a custom list of top teams...');

    // 1. Load the list of team names to find
    const teamNamesContent = fs.readFileSync(teamNamesInputFile, 'utf-8');
    const { famous_football_clubs_original_names: targetTeamNames } = JSON.parse(teamNamesContent);

    const normalizedTargetNames = targetTeamNames.map(normalize);
    console.log(`📋 Loaded ${normalizedTargetNames.length} unique team names to find.`);

    // 2. Iterate through data files to find the teams
    const foundTeams: OutputTeam[] = [];
    const foundTeamIds = new Set<number>(); // To prevent duplicates

    const regionFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'summary.json');

    for (const file of regionFiles) {
      const filePath = path.join(dataDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const leagues: League[] = JSON.parse(content);

      for (const league of leagues) {
        if (!league.teams || league.teams.length === 0) {
          continue;
        }

        for (const team of league.teams) {
          const normalizedTeamNameFromData = normalize(team.name);

          for (const normalizedTarget of normalizedTargetNames) {
            if (normalizedTeamNameFromData.includes(normalizedTarget)) {
              if (!foundTeamIds.has(team.id)) {
                foundTeams.push({
                  id: team.id,
                  name: team.name,
                  logo: team.logo,
                  leagueId: team.leagueId,
                });
                foundTeamIds.add(team.id);
              }
              break;
            }
          }
        }
      }
    }

    console.log(`✅ Found ${foundTeams.length} matching teams.`);

    // 3. Structure the found teams into a single virtual league
    console.log('🏗️  Structuring found teams into a virtual league format...');

    const teamsForVirtualLeague = foundTeams.map(team => ({
      ...team,
      leagueId: VIRTUAL_LEAGUE_ID, // Update leagueId to point to our virtual league
    }));

    const virtualLeague: RawLeague = {
      id: VIRTUAL_LEAGUE_ID,
      name: 'Top Teams',
      country: 'World',
      logo: 'https://img.icons8.com/fluency/96/trophy.png', // Generic trophy icon
      teams: teamsForVirtualLeague,
    };

    const finalOutput = [virtualLeague];

    // 4. Write the final list to the output file
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, JSON.stringify(finalOutput, null, 2), 'utf-8');

    console.log(`\n🎉 Successfully created custom team list with ${foundTeams.length} teams at: ${outputPath}`);
  }
  catch (error) {
    console.error('❌ An error occurred:', error);
  }
}

createTopTeamsList();
