/**
 * Clear all hymns from the database
 */

import { prisma } from '../lib/db/prisma';

async function main() {
  console.log('Clearing database...');

  // Delete all hymn-tag relationships first
  const deletedTags = await prisma.hymnTag.deleteMany();
  console.log(`Deleted ${deletedTags.count} hymn-tag relationships`);

  // Delete all hymns
  const deletedHymns = await prisma.hymn.deleteMany();
  console.log(`Deleted ${deletedHymns.count} hymns`);

  console.log('\n✓ Database cleared successfully');

  await prisma.$disconnect();
}

main().catch(console.error);
