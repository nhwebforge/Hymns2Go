/**
 * Populate catalogueTitle field for all hymns
 * Removes leading punctuation and special characters for proper alphabetical sorting
 *
 * Usage: npx tsx scripts/populate-catalogue-titles.ts
 */

import { prisma } from '../lib/db/prisma';

function generateCatalogueTitle(title: string): string {
  // Remove leading punctuation, quotes, and special characters
  // Matches: quotes, apostrophes, brackets, dashes, periods, etc.
  const cleaned = title.replace(/^["'""''`´'„‚«»‹›\[\](){}<>¡¿\-–—•*†‡§¶.,:;!?\s]+/g, '');

  // If the entire title was punctuation (unlikely), return the original
  return cleaned.length > 0 ? cleaned : title;
}

async function main() {
  console.log('Starting catalogue title population...\n');

  try {
    // Get all hymns
    const hymns = await prisma.hymn.findMany({
      select: {
        id: true,
        title: true,
        catalogueTitle: true,
      },
      orderBy: {
        title: 'asc',
      },
    });

    console.log(`Found ${hymns.length} hymns to process\n`);

    let updated = 0;
    let unchanged = 0;
    let errors = 0;

    for (const hymn of hymns) {
      try {
        const newCatalogueTitle = generateCatalogueTitle(hymn.title);

        // Only update if different from current value
        if (hymn.catalogueTitle !== newCatalogueTitle) {
          await prisma.hymn.update({
            where: { id: hymn.id },
            data: { catalogueTitle: newCatalogueTitle },
          });

          if (hymn.title !== newCatalogueTitle) {
            console.log(`✓ Updated: "${hymn.title}" → "${newCatalogueTitle}"`);
          }

          updated++;
        } else {
          unchanged++;
        }
      } catch (error) {
        console.error(`✗ Failed to update hymn ${hymn.id} (${hymn.title}):`, error);
        errors++;
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total hymns: ${hymns.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Unchanged: ${unchanged}`);
    console.log(`Errors: ${errors}`);

    // Show some examples of titles that were changed
    console.log(`\n=== Examples of Changed Titles ===`);
    const changedExamples = await prisma.hymn.findMany({
      where: {
        NOT: {
          OR: [
            { catalogueTitle: { equals: prisma.raw('title') } },
            { catalogueTitle: null },
          ],
        },
      },
      select: {
        title: true,
        catalogueTitle: true,
      },
      take: 10,
      orderBy: {
        title: 'asc',
      },
    });

    for (const example of changedExamples) {
      console.log(`  "${example.title}" → catalogued as "${example.catalogueTitle}"`);
    }

  } catch (error) {
    console.error('Population failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
