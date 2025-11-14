import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

interface Team {
  id: number;
  code: string | null;
  name: string;
  country: string;
  national: boolean;
  logo: string;
  leagueId: number;
}

interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  teams?: Team[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const teamsFilePath = path.join(__dirname, '../data/sport/teams.json');
const regionsDirPath = path.join(__dirname, '../data/sport/leagues-by-regions');

const allTeams: Team[] = JSON.parse(fs.readFileSync(teamsFilePath, 'utf-8'));

async function mergeTeamsIntoRegions() {
  try {
    const regionFiles = fs.readdirSync(regionsDirPath).filter(file => file.endsWith('.json'));

    for (const file of regionFiles) {
      const filePath = path.join(regionsDirPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // Skip if it's not an array (e.g., summary.json)
      if (!Array.isArray(data)) {
        console.warn(`⚠️ Skipping ${file} — not an array`);
        continue;
      }

      const updatedLeagues = data.map((league: League) => {
        const teamsForLeague = allTeams.filter(team => team.leagueId === league.id);
        return { ...league, teams: teamsForLeague ?? [] };
      });

      fs.writeFileSync(filePath, JSON.stringify(updatedLeagues, null, 2), 'utf-8');
      console.log(`✅ Updated ${file} (${updatedLeagues.length} leagues)`);
    }

    console.log('🎉 Successfully merged teams into region league files.');
  }
  catch (error) {
    console.error('❌ Error merging teams into region league files:', error);
  }
}

mergeTeamsIntoRegions();
