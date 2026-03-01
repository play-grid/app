import process from 'node:process';
import { APICountriesClient } from '@playgrid/data-pipeline';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { countriesTable } from '@/db/schema';

const TOP_GDP_COUNTRIES = [
  'United States',
  'China',
  'Germany',
  'Japan',
  'India',
  'United Kingdom',
  'France',
  'Italy',
  'Brazil',
  'Ghana',
  'Libya',
  'Tunisia',
  'Jordan',
  'Lebanon',
  'Syria',
  'Mauritania',
  'Djibouti',
  'Comoros',
  'Somalia',
  'Yemen',
  'Canada',
  'Russia',
  'Mexico',
  'Australia',
  'Palestine',
  'Bahrain',
  'Spain',
  'Indonesia',
  'Netherlands',
  'Turkey',
  'Saudi Arabia',
  'Switzerland',
  'Poland',
  'Argentina',
  'Belgium',
  'Sweden',
  'Ireland',
  'Thailand',
  'United Arab Emirates',
  'Austria',
  'Singapore',
  'Norway',
  'Bangladesh',
  'Philippines',
  'Vietnam',
  'Denmark',
  'Iran',
  'Malaysia',
  'Egypt',
  'Hong Kong',
  'South Africa',
  'Nigeria',
  'Colombia',
  'Romania',
  'Pakistan',
  'Chile',
  'Finland',
  'Portugal',
  'Peru',
  'Kazakhstan',
  'New Zealand',
  'Iraq',
  'Algeria',
  'Greece',
  'Qatar',
  'Hungary',
  'Ukraine',
  'Kuwait',
  'Ethiopia',
  'Morocco',
  'Slovakia',
  'Dominican Republic',
  'Ecuador',
  'Sudan',
  'Oman',
  'Kenya',
  'Guatemala',
  'Bulgaria',
  'Uzbekistan',
  'Costa Rica',
  'Luxembourg',
  'Angola',
  'Croatia',
  'Sri Lanka',
  'Panama',
  'Serbia',
  'Lithuania',
  'Tanzania',
  'Uruguay',
];

const dbPath = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/b03431d2e16fe7a9ac99e19096d2a983b1db62385375ffc7f8dc90e4503488fb.sqlite';

async function seedCountries() {
  console.log('🌍 Seeding countries database...\n');

  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);
  const apiClient = new APICountriesClient();

  const existing = await db.select().from(countriesTable);
  if (existing.length > 0) {
    console.log(`⚠️  Countries table already has ${existing.length} records`);
    console.log('To reseed, delete countries table and run this script again');
    process.exit(0);
  }

  console.log(`📦 Fetching data for ${TOP_GDP_COUNTRIES.length} countries from API...`);
  let inserted = 0;
  let failed = 0;

  for (const countryName of TOP_GDP_COUNTRIES) {
    try {
      const apiCountries = await apiClient.getCountryByName(countryName);

      if (apiCountries.length > 0) {
        const apiCountry = apiCountries[0];

        if (!apiCountry.flags?.png) {
          failed++;
          console.log(`⚠️  No flag URL for: ${countryName}`);
          continue;
        }

        const insertData: {
          name: string;
          nameAr: string | null;
          flagUrl: string;
          countryCode: string;
          externalId: string;
          region: string | null;
        } = {
          name: apiCountry.name.common,
          nameAr: apiCountry.translations?.ara?.common || null,
          flagUrl: apiCountry.flags.png,
          countryCode: apiCountry.cca2,
          externalId: apiCountry.cca2,
          region: apiCountry.region || null,
        };

        await db.insert(countriesTable).values(insertData);

        inserted++;
        console.log(`✅ ${countryName} (${apiCountry.cca2})`);
      }
      else {
        failed++;
        console.log(`⚠️  No data for: ${countryName}`);
      }
    }
    catch (error) {
      failed++;
      console.error(`❌ Failed to fetch ${countryName}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Failed: ${failed}`);
  process.exit(0);
}

seedCountries().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
