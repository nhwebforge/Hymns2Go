/**
 * Clear all hymns from the database
 *
 * Usage: npx tsx scripts/clear-hymns.ts
 */

import { prisma } from '../lib/db/prisma';

async function main() {
  console.log('Clearing all hymns from database...');

  // Delete in correct order due to foreign key constraints
  const deletedHymnTags = await prisma.hymnTag.deleteMany({});
  console.log(`Deleted ${deletedHymnTags.count} hymn-tag relationships`);

  const deletedHymns = await prisma.hymn.deleteMany({});
  console.log(`Deleted ${deletedHymns.count} hymns`);

  const deletedTags = await prisma.tag.deleteMany({});
  console.log(`Deleted ${deletedTags.count} tags`);

  console.log('✓ Database cleared successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
