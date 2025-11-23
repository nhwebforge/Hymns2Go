import { prisma } from '../lib/db/prisma';

async function main() {
  const total = await prisma.hymn.count();
  console.log(`\nTotal hymns in database: ${total}\n`);

  const hymnsWithHymnTitle = await prisma.hymn.count({
    where: {
      title: {
        startsWith: 'Hymn ',
      },
    },
  });

  console.log(`Hymns with "Hymn NNN" title: ${hymnsWithHymnTitle}`);
  console.log(`Percentage: ${((hymnsWithHymnTitle / total) * 100).toFixed(1)}%\n`);

  console.log('Sample of "Hymn NNN" titles:');
  const badSamples = await prisma.hymn.findMany({
    where: {
      title: {
        startsWith: 'Hymn ',
      },
    },
    take: 10,
    select: {
      title: true,
      author: true,
      firstLine: true,
      hymnalCode: true,
      hymnalNumber: true,
    },
  });

  badSamples.forEach(h => {
    console.log(`  ${h.hymnalCode} #${h.hymnalNumber}: "${h.title}" - ${h.firstLine || 'No first line'}`);
  });

  console.log('\nSample of good titles:');
  const goodSamples = await prisma.hymn.findMany({
    where: {
      NOT: {
        title: {
          startsWith: 'Hymn ',
        },
      },
    },
    take: 10,
    select: {
      title: true,
      author: true,
      hymnalCode: true,
      hymnalNumber: true,
    },
  });

  goodSamples.forEach(h => {
    console.log(`  ${h.hymnalCode} #${h.hymnalNumber}: "${h.title}" - by ${h.author || 'Unknown'}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
