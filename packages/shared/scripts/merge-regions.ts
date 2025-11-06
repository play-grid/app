import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { REGION_MAP } from './region-map';

const leaguesDir = path.join(process.cwd(), 'packages/shared/data/split/leagues');
const outDir = path.join(process.cwd(), 'packages/shared/data/regions');

const regionGroups: Record<string, any[]> = {};

for (const file of fs.readdirSync(leaguesDir)) {
  if (!file.endsWith('.json'))
    continue;
  const country = file.replace(/^leagues-/, '').replace(/\.json$/, '');
  const region = REGION_MAP[country] || 'other';

  const data = JSON.parse(fs.readFileSync(path.join(leaguesDir, file), 'utf-8'));
  if (!regionGroups[region])
    regionGroups[region] = [];
  regionGroups[region].push(...data);
}

if (!fs.existsSync(outDir))
  fs.mkdirSync(outDir, { recursive: true });

for (const [region, leagues] of Object.entries(regionGroups)) {
  const outPath = path.join(outDir, `region-${region}.json`);
  fs.writeFileSync(outPath, JSON.stringify(leagues, null, 2));
  console.log(`✅ Merged ${leagues.length} leagues → ${outPath}`);
}

fs.writeFileSync(
  path.join(outDir, 'summary.json'),
  JSON.stringify(
    Object.fromEntries(
      Object.entries(regionGroups).map(([k, v]) => [k, v.length]),
    ),
    null,
    2,
  ),
);
console.log(`📊 Summary written → ${path.join(outDir, 'summary.json')}`);
