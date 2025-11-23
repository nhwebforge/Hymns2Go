/**
 * Search for "Awake my soul and with the sun" in the database
 */

import { prisma } from '../lib/db/prisma';

async function main() {
  const hymns = await prisma.hymn.findMany({
    where: {
      OR: [
        {
          title: {
            contains: 'Awake',
            mode: 'insensitive',
          },
        },
        {
          firstLine: {
            contains: 'Awake',
            mode: 'insensitive',
          },
        },
        {
          rawText: {
            contains: 'Awake my soul',
            mode: 'insensitive',
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      author: true,
      meter: true,
      firstLine: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });

  console.log(`Found ${hymns.length} hymns with "Awake":`);
  hymns.forEach((hymn) => {
    console.log('\n---');
    console.log('Title:', hymn.title);
    console.log('Author:', hymn.author);
    console.log('Meter:', hymn.meter);
    console.log('First Line:', hymn.firstLine);
    console.log('Created:', hymn.createdAt);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
