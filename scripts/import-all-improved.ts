/**
 * Master import script for all hymn sources
 * Imports from all hymnary.org hymnals and praise.org.uk
 * Includes duplicate detection, license agreement handling, and source URL tracking
 *
 * Usage: npx tsx scripts/import-all-improved.ts
 */

import { prisma } from '../lib/db/prisma';
import { HymnaryImporter } from '../lib/import-utils/hymnary-importer';
import type { HymnForComparison } from '../lib/import-utils/duplicate-detector';

// Import the praise.org.uk script functions
// Note: We'll run it separately since it has different structure

const HYMNALS = [
  { code: 'CAH2000', name: 'Complete Anglican Hymns Old and New' },
  { code: 'AM2013', name: 'Ancient & Modern' },
  { code: 'NEH1985', name: 'The New English Hymnal' },
  { code: 'CPAM2000', name: 'Church Praise & Music' },
  { code: 'GG2013', name: 'Gather Comprehensive Second Edition' },
  { code: 'UMH', name: 'United Methodist Hymnal' },
  { code: 'LSB2006', name: 'Lutheran Service Book' },
  { code: 'BH1991', name: 'Baptist Hymnal' },
  { code: 'AAHH2001', name: 'African American Heritage Hymnal' },
  { code: 'CBOW1994', name: 'Complete Book of Worship' },
];

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('MASTER HYMN IMPORT');
  console.log('Importing from all sources with duplicate detection and license handling');
  console.log('='.repeat(80) + '\n');

  try {
    // Load existing hymns for duplicate detection
    let existingHymns: HymnForComparison[] = await prisma.hymn.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        firstLine: true,
        rawText: true,
        sourceUrl: true,
      },
    });

    console.log(`Loaded ${existingHymns.length} existing hymns for duplicate detection\n`);

    let totalImported = 0;
    let totalDuplicates = 0;
    let totalLicenseIssues = 0;
    let totalErrors = 0;

    // Import from each hymnal
    for (const hymnal of HYMNALS) {
      console.log('\n' + '='.repeat(80));
      console.log(`IMPORTING: ${hymnal.name} (${hymnal.code})`);
      console.log('='.repeat(80));

      try {
        const importer = new HymnaryImporter(hymnal.code, hymnal.name, existingHymns);
        await importer.runImport();

        // Update existingHymns list after each hymnal
        existingHymns = await prisma.hymn.findMany({
          select: {
            id: true,
            title: true,
            author: true,
            firstLine: true,
            rawText: true,
            sourceUrl: true,
          },
        });

        console.log(`\nTotal hymns in database now: ${existingHymns.length}\n`);
      } catch (error) {
        console.error(`\n❌ Error importing ${hymnal.name}:`, error);
        console.log('Continuing with next hymnal...\n');
      }
    }

    // Final summary
    const finalCount = await prisma.hymn.count();
    const tagCount = await prisma.tag.count();

    console.log('\n' + '='.repeat(80));
    console.log('IMPORT COMPLETE');
    console.log('='.repeat(80));
    console.log(`Total hymns in database: ${finalCount}`);
    console.log(`Total tags in database: ${tagCount}`);
    console.log('='.repeat(80) + '\n');

    console.log('\n📝 Next step: Run the praise.org.uk import separately:');
    console.log('   npx tsx scripts/import-praise.ts\n');

  } catch (error) {
    console.error('\n❌ Fatal error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
