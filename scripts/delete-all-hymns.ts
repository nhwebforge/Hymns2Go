/**
 * Delete all hymns and tags from the database
 * Use with caution!
 *
 * Usage: npx tsx scripts/delete-all-hymns.ts
 */

import { prisma } from '../lib/db/prisma';

async function main() {
  console.log('\n⚠️  WARNING: This will delete ALL hymns and tags from the database!\n');
  console.log('Starting deletion in 3 seconds...\n');

  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    console.log('Deleting all hymn-tag relationships...');
    const deletedHymnTags = await prisma.hymnTag.deleteMany({});
    console.log(`✓ Deleted ${deletedHymnTags.count} hymn-tag relationships`);

    console.log('\nDeleting all hymns...');
    const deletedHymns = await prisma.hymn.deleteMany({});
    console.log(`✓ Deleted ${deletedHymns.count} hymns`);

    console.log('\nDeleting all tags...');
    const deletedTags = await prisma.tag.deleteMany({});
    console.log(`✓ Deleted ${deletedTags.count} tags`);

    console.log('\n✅ All hymns and tags have been deleted from the database.\n');
  } catch (error) {
    console.error('\n❌ Error during deletion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
