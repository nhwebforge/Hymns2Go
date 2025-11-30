/**
 * Regenerate hymn structures from rawText to preserve punctuation
 * Run this after fixing the cleanText function to not strip punctuation
 */

import { prisma } from '../lib/db/prisma';
import { parseHymnText } from '../lib/hymn-processor/parser';

async function main() {
  console.log('Regenerating hymn structures to preserve punctuation...\n');

  try {
    // Get all hymns
    const hymns = await prisma.hymn.findMany({
      select: {
        id: true,
        title: true,
        rawText: true,
      },
    });

    console.log(`Found ${hymns.length} hymns to process\n`);

    let updated = 0;
    let skipped = 0;

    for (const hymn of hymns) {
      if (!hymn.rawText) {
        console.log(`  Skipping ${hymn.title} - no rawText`);
        skipped++;
        continue;
      }

      // Re-parse the raw text with the updated cleanText function
      const structure = parseHymnText(hymn.rawText);

      // Update the hymn with the new structure
      await prisma.hymn.update({
        where: { id: hymn.id },
        data: {
          structure: structure as any,
        },
      });

      updated++;
      if (updated % 100 === 0) {
        console.log(`  Processed ${updated} / ${hymns.length}`);
      }
    }

    console.log(`\n✓ Completed:`);
    console.log(`  - Updated: ${updated} hymns`);
    console.log(`  - Skipped: ${skipped} hymns`);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
