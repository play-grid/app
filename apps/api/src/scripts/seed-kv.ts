import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import Cloudflare from 'cloudflare';
import env from '@/env';

interface SeedOptions {
  kvNamespaceId: string;
  dataPath: string;
  keyField?: string; // Field to use as the KV key (defaults to using the entire object as key)
  batchSize?: number;
  transformValue?: (item: any) => string; // Optional transform function for values
}

async function seedKV(options: SeedOptions) {
  const {
    kvNamespaceId,
    dataPath,
    keyField,
    batchSize = 1000,
    transformValue = item => JSON.stringify(item),
  } = options;

  // Get environment variables
  const ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
  const API_TOKEN = env.CLOUDFLARE_KV_API_TOKEN;

  const client = new Cloudflare({
    apiToken: API_TOKEN,
  });

  // Read data from JSON file
  const fullPath = join(process.cwd(), dataPath);
  const rawData = JSON.parse(readFileSync(fullPath, 'utf-8'));
  const dataArray = Array.isArray(rawData) ? rawData : [rawData];

  console.log(`Starting seed process for ${dataArray.length} items...`);
  console.log(`Target KV Namespace: ${kvNamespaceId}`);

  // Batch the data
  const batches: any[][] = [];
  for (let i = 0; i < dataArray.length; i += batchSize) {
    batches.push(dataArray.slice(i, i + batchSize));
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    try {
      // Transform items into the format expected by bulkUpdate
      const kvPairs = batch.map((item: any) => {
        // Use specified field as key, or generate from item
        const key = keyField ? item[keyField] : JSON.stringify(item);

        if (!key) {
          throw new Error(`Key field "${keyField}" not found in item: ${JSON.stringify(item)}`);
        }

        return {
          key: String(key),
          value: transformValue(item),
        };
      });

      await client.kv.namespaces.bulkUpdate(kvNamespaceId, {
        account_id: ACCOUNT_ID,
        body: kvPairs,
      });

      successCount += batch.length;
      console.log(`✓ Batch ${i + 1}/${batches.length} complete (${successCount}/${dataArray.length} items)`);
    }
    catch (error) {
      console.error(`✗ Error seeding batch ${i + 1}:`, error);
      errorCount += batch.length;
    }
  }

  console.log('\n✅ Seeding complete!');
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}
// Export the generic seed function and run questions seed by default
export { seedKV };
