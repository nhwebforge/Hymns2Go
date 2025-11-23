import { prisma } from '../lib/db/prisma';

async function main() {
  const hymn = await prisma.hymn.findFirst({
    where: {
      title: {
        contains: 'All glory',
        mode: 'insensitive'
      }
    }
  });

  if (hymn) {
    console.log('Title:', hymn.title);
    console.log('\nRaw Text:');
    console.log(hymn.rawText);
    console.log('\nStructure:');
    console.log(JSON.stringify(hymn.structure, null, 2));
  } else {
    console.log('Hymn not found');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
