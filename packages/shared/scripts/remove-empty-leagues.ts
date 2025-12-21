import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataRoot = path.join(__dirname, '../data/sport');

// Add all directories you want to process here
const targetDirectories = [
  path.join(dataRoot, 'custom-lists'),
  path.join(dataRoot, 'leagues-by-regions'),
];

// --- TYPES ---
interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  teams: unknown[];
}

// --- SCRIPT LOGIC ---
async function processDirectory(dirPath: string) {
  try {
    console.log(`\n🔍 Processing directory: ${path.basename(dirPath)}`);

    if (!fs.existsSync(dirPath)) {
      console.warn(`⚠️ Directory not found, skipping: ${dirPath}`);
      return;
    }

    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));

    if (files.length === 0) {
      console.warn('⚠️ No JSON files found in this directory.');
      return;
    }

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      let data;
      try {
        data = JSON.parse(content);
      }
      catch (e) {
        console.warn(`⚠️ Skipping ${file} — Invalid JSON.`);
        continue;
      }

      if (!Array.isArray(data)) {
        console.log(`- Skipped ${file}: Content is not a league array.`);
        continue;
      }

      const leagues: League[] = data;
      const originalCount = leagues.length;
      const filteredLeagues = leagues.filter(league => league.teams && league.teams.length > 0);
      const removedCount = originalCount - filteredLeagues.length;

      if (removedCount > 0) {
        fs.writeFileSync(filePath, JSON.stringify(filteredLeagues, null, 2), 'utf-8');
        console.log(`✅ Updated ${file}: Removed ${removedCount} leagues with empty teams.`);
      }
      else {
        console.log(`- Skipped ${file}: No empty leagues found.`);
      }
    }
  }
  catch (error) {
    console.error(`❌ An error occurred while processing ${path.basename(dirPath)}:`, error);
  }
}

async function main() {
  console.log('🚀 Starting script to remove leagues with empty teams...');
  for (const dir of targetDirectories) {
    await processDirectory(dir);
  }
  console.log('\n🎉 All directories processed.');
}

main();
