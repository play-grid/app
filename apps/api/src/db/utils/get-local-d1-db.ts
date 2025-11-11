import fs from 'node:fs';
import path from 'node:path';

export function getLocalD1DB() {
  try {
    const basePath = path.resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject');

    if (!fs.existsSync(basePath)) {
      throw new Error(
        `Local D1 database not found at ${basePath}.\n`
        + `Please run 'wrangler dev' first to initialize the local database.`,
      );
    }

    const files = fs.readdirSync(basePath, { encoding: 'utf-8' });
    const dbFile = files.find(f => f.endsWith('.sqlite'));

    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    return path.resolve(basePath, dbFile);
  }
  catch (err) {
    console.error(`Error finding local D1 database: ${err}`);
    throw err;
  }
}
