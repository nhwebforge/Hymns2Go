/**
 * Check "All for Jesus" hymn data in database
 */

import { prisma } from '../lib/db/prisma';

async function main() {
  const hymns = await prisma.hymn.findMany({
    where: {
      OR: [
        {
          title: {
            contains: 'All for Jesus',
            mode: 'insensitive',
          },
        },
        {
          firstLine: {
            contains: 'All for Jesus',
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
      translator: true,
      year: true,
      publisher: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  console.log(`Found ${hymns.length} hymns matching "All for Jesus":\n`);
  hymns.forEach((hymn, index) => {
    console.log(`=== HYMN ${index + 1} ===`);
    console.log('ID:', hymn.id);
    console.log('Title:', hymn.title);
    console.log('Author:', hymn.author);
    console.log('Meter:', hymn.meter);
    console.log('First Line:', hymn.firstLine);
    console.log('Translator:', hymn.translator);
    console.log('Year:', hymn.year);
    console.log('Publisher:', hymn.publisher);
    console.log('Created:', hymn.createdAt);
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch(console.error);
