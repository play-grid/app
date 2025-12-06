import { spawn } from 'node:child_process';
import process from 'node:process';
import { logger } from '@/utils/logger';

async function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      }
      else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    logger.info('Running production migrations...');
    await runCommand('wrangler', ['d1', 'migrations', 'apply', 'GAME_HUB_DB', '--remote']);
    logger.info('Migrations applied successfully.');
  }
  catch (error) {
    logger.error(error, 'Production migration and seed failed:');
    process.exit(1);
  }
}

main();
