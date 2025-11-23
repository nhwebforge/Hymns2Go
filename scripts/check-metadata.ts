/**
 * Check if metadata is being saved to database
 */
import { prisma } from '../lib/db/prisma';

async function main() {
  // Check hymn #14 - "All glory, laud, and honour"
  const hymn = await prisma.hymn.findFirst({
    where: {
      title: {
        contains: 'glory, laud',
        mode: 'insensitive'
      }
    },
    select: {
      title: true,
      author: true,
      translator: true,
      firstLine: true,
      meter: true,
      language: true,
      year: true
    }
  });

  console.log('\n=== Hymn #14 Metadata from Database ===');
  console.log('Title:', hymn?.title);
  console.log('Author:', hymn?.author);
  console.log('Translator:', hymn?.translator);
  console.log('First Line:', hymn?.firstLine);
  console.log('Meter:', hymn?.meter);
  console.log('Language:', hymn?.language);
  console.log('Year:', hymn?.year);

  await prisma.$disconnect();
}

main().catch(console.error);
