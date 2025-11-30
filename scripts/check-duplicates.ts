/**
 * Check for duplicate hymn IDs in the database
 */

import { prisma } from '../lib/db/prisma';

async function main() {
  console.log('Checking for duplicate hymn IDs...\n');

  // Get all hymns ordered by catalogueTitleLower to see if there are duplicates
  const hymns = await prisma.hymn.findMany({
    select: {
      id: true,
      title: true,
      catalogueTitle: true,
    },
    orderBy: {
      catalogueTitleLower: 'asc',
    },
    take: 100,
  });

  console.log(`First 100 hymns:`);
  const idCounts: Record<string, number> = {};

  hymns.forEach((hymn, index) => {
    idCounts[hymn.id] = (idCounts[hymn.id] || 0) + 1;
    console.log(`${index + 1}. [${hymn.id}] ${hymn.title}`);
  });

  console.log('\n\nChecking for duplicate IDs in this batch:');
  const duplicates = Object.entries(idCounts).filter(([_, count]) => count > 1);

  if (duplicates.length > 0) {
    console.log('Found duplicates:');
    duplicates.forEach(([id, count]) => {
      console.log(`  ID ${id} appears ${count} times`);
    });
  } else {
    console.log('No duplicates found in this batch.');
  }

  // Check the specific ID from the error
  const problematicId = 'cmidhrbig005kqzy4i5qm19jm';
  const hymnWithId = await prisma.hymn.findUnique({
    where: { id: problematicId },
    select: {
      id: true,
      title: true,
      author: true,
    },
  });

  console.log(`\n\nChecking specific ID from error: ${problematicId}`);
  if (hymnWithId) {
    console.log(`Found: ${hymnWithId.title} by ${hymnWithId.author || 'Unknown'}`);
  } else {
    console.log('ID not found in database');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
