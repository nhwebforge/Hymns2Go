/**
 * Populate catalogueTitleLower field for all hymns
 *
 * Usage: npx tsx scripts/populate-lowercase-titles.ts
 */

import { prisma } from '../lib/db/prisma';

async function main() {
  console.log('Populating catalogueTitleLower field...\n');

  try {
    // Update all hymns to set catalogueTitleLower from catalogueTitle
    const result = await prisma.hymn.updateMany({
      where: {
        catalogueTitle: {
          not: null,
        },
      },
      data: {
        catalogueTitleLower: prisma.$queryRawUnsafe('LOWER("catalogueTitle")'),
      },
    });

    console.log(`Updated ${result.count} hymns`);
  } catch (error) {
    // If the above doesn't work, do it one by one
    console.log('Batch update failed, updating individually...\n');

    const hymns = await prisma.hymn.findMany({
      select: {
        id: true,
        catalogueTitle: true,
      },
      where: {
        catalogueTitle: {
          not: null,
        },
      },
    });

    let updated = 0;
    for (const hymn of hymns) {
      await prisma.hymn.update({
        where: { id: hymn.id },
        data: {
          catalogueTitleLower: hymn.catalogueTitle!.toLowerCase(),
        },
      });
      updated++;
      if (updated % 100 === 0) {
        console.log(`  Processed ${updated} / ${hymns.length}`);
      }
    }

    console.log(`\nCompleted: Updated ${updated} hymns`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
