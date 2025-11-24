/**
 * Master script to run all hymnal imports sequentially
 * This will take several hours to complete
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';

const hymnals = [
  { file: 'import-cpam.ts', name: 'Church Praise & Music' },
  { file: 'import-gg2013.ts', name: 'Gather Comprehensive Second Edition' },
  { file: 'import-umh.ts', name: 'United Methodist Hymnal' },
  { file: 'import-lsb2006.ts', name: 'Lutheran Service Book' },
  { file: 'import-bh1991.ts', name: 'Baptist Hymnal' },
  { file: 'import-aahh2001.ts', name: 'African American Heritage Hymnal' },
  { file: 'import-cbow1994.ts', name: 'Common Book of Worship' },
];

async function runImport(file: string, name: string): Promise<void> {
  console.log('\\n========================================');
  console.log(`Starting: ${name}`);
  console.log('========================================\\n');

  return new Promise((resolve, reject) => {
    const process = spawn('npx', ['tsx', `scripts/${file}`], {
      cwd: '/Users/nicholasharvey/Hymns2Go/hymns2go',
      stdio: 'inherit',
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`\\n✓ ${name} completed successfully\\n`);
        resolve();
      } else {
        console.error(`\\n✗ ${name} failed with code ${code}\\n`);
        reject(new Error(`Import failed: ${name}`));
      }
    });
  });
}

async function main() {
  console.log('========================================');
  console.log('Starting all hymnal imports...');
  console.log('========================================');

  const startTime = Date.now();

  for (const hymnal of hymnals) {
    try {
      await runImport(hymnal.file, hymnal.name);
      console.log('Waiting 5 seconds before next import...\\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`Error running ${hymnal.name}:`, error);
      // Continue with next import even if one fails
    }
  }

  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000 / 60);

  console.log('\\n========================================');
  console.log('All imports complete!');
  console.log(`Total time: ${duration} minutes`);
  console.log('========================================\\n');

  // Show final count
  console.log('Fetching final hymn count...\\n');
  const countProcess = spawn('npx', ['tsx', 'scripts/count-hymns.ts'], {
    cwd: '/Users/nicholasharvey/Hymns2Go/hymns2go',
    stdio: 'inherit',
  });

  await new Promise((resolve) => {
    countProcess.on('close', resolve);
  });
}

main().catch(console.error);
