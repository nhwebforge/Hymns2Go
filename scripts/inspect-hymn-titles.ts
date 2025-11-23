import { prisma } from '../lib/db/prisma';

async function main() {
  // Find hymns with "Hymn" in the title
  const badHymns = await prisma.hymn.findMany({
    where: {
      title: {
        contains: 'Hymn',
        mode: 'insensitive',
      },
    },
    take: 20,
    select: {
      id: true,
      title: true,
      firstLine: true,
      author: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`\nFound ${badHymns.length} hymns with "Hymn" in title:\n`);

  badHymns.forEach((hymn, index) => {
    console.log(`${index + 1}. "${hymn.title}"`);
    console.log(`   First Line: ${hymn.firstLine || 'N/A'}`);
    console.log(`   Author: ${hymn.author || 'N/A'}`);
    console.log(`   ID: ${hymn.id}`);
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch(console.error);
