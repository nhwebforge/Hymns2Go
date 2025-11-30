/**
 * Verify the quality of imported hymns
 * Checks for:
 * - Duplicate hymns
 * - License agreement text
 * - Missing metadata
 *
 * Usage: npx tsx scripts/verify-import-quality.ts
 */

import { prisma } from '../lib/db/prisma';
import { findDuplicate, normalizeString, normalizeAuthorName } from '../lib/import-utils/duplicate-detector';
import type { HymnStructure } from '../lib/hymn-processor/parser';

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('IMPORT QUALITY VERIFICATION');
  console.log('='.repeat(80) + '\n');

  try {
    // Get all hymns
    const hymns = await prisma.hymn.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        firstLine: true,
        rawText: true,
        sourceUrl: true,
        structure: true,
        hymnalCode: true,
      },
    });

    console.log(`Total hymns in database: ${hymns.length}\n`);

    // Check for license agreement text
    console.log('Checking for license agreement text...');
    const licenseIssues: typeof hymns = [];

    for (const hymn of hymns) {
      const structure = hymn.structure as unknown as HymnStructure | null;
      const firstLine = structure?.sections?.[0]?.lines?.[0]?.text || '';
      const rawTextLower = hymn.rawText?.toLowerCase() || '';

      if (firstLine.toLowerCase().includes('license') ||
          rawTextLower.includes('license agreement') ||
          rawTextLower.includes('to view this media')) {
        licenseIssues.push(hymn);
      }
    }

    if (licenseIssues.length > 0) {
      console.log(`❌ Found ${licenseIssues.length} hymns with license agreement text:`);
      licenseIssues.slice(0, 10).forEach(h => {
        console.log(`   - "${h.title}" (${h.hymnalCode || 'unknown source'})`);
      });
      if (licenseIssues.length > 10) {
        console.log(`   ... and ${licenseIssues.length - 10} more`);
      }
    } else {
      console.log(`✅ No license agreement text found\n`);
    }

    // Check for duplicates
    console.log('\nChecking for potential duplicates...');
    const duplicates: Array<{
      hymn1: typeof hymns[0];
      hymn2: typeof hymns[0];
      reason: string;
      confidence: number;
    }> = [];

    for (let i = 0; i < hymns.length; i++) {
      const hymn1 = hymns[i];

      for (let j = i + 1; j < hymns.length; j++) {
        const hymn2 = hymns[j];

        const match = findDuplicate(hymn1, [hymn2]);
        if (match && match.confidence >= 0.85) {
          duplicates.push({
            hymn1,
            hymn2,
            reason: match.reason,
            confidence: match.confidence,
          });
        }
      }

      if ((i + 1) % 100 === 0) {
        console.log(`  Checked ${i + 1}/${hymns.length} hymns...`);
      }
    }

    console.log(`\nDuplicate check complete.`);

    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} potential duplicates:\n`);

      // Group by title
      const byTitle = new Map<string, typeof duplicates>();
      duplicates.forEach(dup => {
        const normalizedTitle = normalizeString(dup.hymn1.title);
        if (!byTitle.has(normalizedTitle)) {
          byTitle.set(normalizedTitle, []);
        }
        byTitle.get(normalizedTitle)!.push(dup);
      });

      // Show top duplicates
      let shown = 0;
      for (const [title, dups] of byTitle) {
        if (shown >= 20) break;

        console.log(`Title: "${dups[0].hymn1.title}"`);
        console.log(`  Instances: ${dups.length + 1}`);

        // Show all instances
        const instances = new Map<string, {title: string, author: string | null, source: string | null}>();
        dups.forEach(dup => {
          instances.set(dup.hymn1.id, {
            title: dup.hymn1.title,
            author: dup.hymn1.author,
            source: dup.hymn1.hymnalCode
          });
          instances.set(dup.hymn2.id, {
            title: dup.hymn2.title,
            author: dup.hymn2.author,
            source: dup.hymn2.hymnalCode
          });
        });

        instances.forEach((inst, id) => {
          console.log(`    - "${inst.title}" by ${inst.author || 'Unknown'} (${inst.source || 'unknown'})`);
        });

        console.log(`  Reason: ${dups[0].reason} (${(dups[0].confidence * 100).toFixed(0)}% confidence)\n`);
        shown++;
      }

      if (byTitle.size > 20) {
        console.log(`... and ${byTitle.size - 20} more duplicate groups\n`);
      }
    } else {
      console.log(`✅ No duplicates found\n`);
    }

    // Check for missing metadata
    console.log('\nChecking for missing metadata...');
    let missingAuthor = 0;
    let missingFirstLine = 0;
    let missingSourceUrl = 0;

    for (const hymn of hymns) {
      if (!hymn.author) missingAuthor++;
      if (!hymn.firstLine) missingFirstLine++;
      if (!hymn.sourceUrl) missingSourceUrl++;
    }

    console.log(`  Hymns missing author: ${missingAuthor} (${(missingAuthor / hymns.length * 100).toFixed(1)}%)`);
    console.log(`  Hymns missing first line: ${missingFirstLine} (${(missingFirstLine / hymns.length * 100).toFixed(1)}%)`);
    console.log(`  Hymns missing source URL: ${missingSourceUrl} (${(missingSourceUrl / hymns.length * 100).toFixed(1)}%)`);

    // Summary by source
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY BY SOURCE');
    console.log('='.repeat(80));

    const bySources = new Map<string, number>();
    hymns.forEach(h => {
      const source = h.hymnalCode || 'unknown';
      bySources.set(source, (bySources.get(source) || 0) + 1);
    });

    const sortedSources = Array.from(bySources.entries()).sort((a, b) => b[1] - a[1]);
    sortedSources.forEach(([source, count]) => {
      console.log(`  ${source}: ${count} hymns`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('VERIFICATION COMPLETE');
    console.log('='.repeat(80));
    console.log(`Total hymns: ${hymns.length}`);
    console.log(`License issues: ${licenseIssues.length}`);
    console.log(`Potential duplicates: ${duplicates.length}`);
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ Error during verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
