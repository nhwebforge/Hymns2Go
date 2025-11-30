import { prisma } from '../lib/db/prisma';

async function checkCatalogueTitles() {
  const hymns = await prisma.hymn.findMany({
    select: {
      id: true,
      title: true,
      catalogueTitle: true,
      catalogueTitleLower: true,
    },
    orderBy: {
      catalogueTitleLower: 'asc',
    },
    take: 20,
  });

  console.log('First 20 hymns ordered by catalogueTitleLower:');
  console.log('');
  hymns.forEach((h, i) => {
    console.log(`${i + 1}. "${h.title}"`);
    console.log(`   catalogueTitle: "${h.catalogueTitle}"`);
    console.log(`   catalogueTitleLower: "${h.catalogueTitleLower}"`);
    console.log('');
  });

  // Check for nulls
  const nullCount = await prisma.hymn.count({
    where: {
      OR: [
        { catalogueTitle: null },
        { catalogueTitleLower: null },
      ],
    },
  });

  console.log(`Hymns with null catalogue titles: ${nullCount}`);
}

checkCatalogueTitles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
