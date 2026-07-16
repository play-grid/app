/* eslint-disable no-console */
/**
 * CLI script to upsert all companies from the JSON manifest via the admin API.
 *
 * Usage:
 *   npx tsx apps/api/seeds/seed-companies-from-api.ts --api-url http://localhost:8789/api --token <admin-token>
 *
 * This is useful for seeding production or staging environments where
 * running the local D1 seeder isn't possible.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const apiUrl = args.find(a => a.startsWith('--api-url='))?.split('=')[1] || 'http://localhost:8789/api';
const token = args.find(a => a.startsWith('--token='))?.split('=')[1];

if (!token) {
  console.error('ERROR: --token is required');
  console.error('Usage: npx tsx seed-companies-from-api.ts --api-url <url> --token <admin-token>');
  process.exit(1);
}

interface CompanySeed {
  nameEn: string;
  nameAr: string | null;
  listId: 'companies' | 'saudi';
}

async function main() {
  const companies: CompanySeed[] = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'shared/companies.json'), 'utf-8'),
  );

  console.log(`Loaded ${companies.length} companies from manifest`);
  console.log(`Target API: ${apiUrl}`);
  console.log('');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const company of companies) {
    try {
      // Check if exists first
      const checkUrl = `${apiUrl}/admin/companies?filter[nameEn]=${encodeURIComponent(company.nameEn)}&limit=1`;
      const checkRes = await fetch(checkUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!checkRes.ok) {
        const text = await checkRes.text();
        console.error(`  ✗ Check failed for ${company.nameEn}: ${text}`);
        errors++;
        continue;
      }

      const checkData: { data?: { length: number } } = await checkRes.json();

      if (checkData.data && checkData.data.length > 0) {
        skipped++;
        continue;
      }

      // Create company
      const createRes = await fetch(`${apiUrl}/admin/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nameEn: company.nameEn,
          nameAr: company.nameAr,
          listId: company.listId,
          sync: true,
        }),
      });

      if (!createRes.ok) {
        const text = await createRes.text();
        console.error(`  ✗ Create failed for ${company.nameEn}: ${text}`);
        errors++;
        continue;
      }

      created++;
      if (created % 20 === 0) {
        console.log(`  ... ${created} created, ${skipped} skipped, ${errors} errors`);
      }
    }
    catch (error) {
      console.error(`  ✗ Error for ${company.nameEn}:`, error);
      errors++;
    }
  }

  console.log('');
  console.log('Done!');
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors:  ${errors}`);
}

main().catch(console.error);
