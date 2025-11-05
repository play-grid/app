import { spawn } from 'node:child_process';
import process from 'node:process';


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
    console.log('Running production migrations...');
    await runCommand('wrangler', ['d1', 'migrations', 'apply', 'GAME_HUB_DB', '--remote']);
    console.log('Migrations applied successfully.');
  }
  catch (error) {
    console.error('Production migration and seed failed:', error);
    process.exit(1);
  }
}

main();
