import { writeFileSync, readFileSync } from 'fs';

const template = readFileSync('scripts/import-cpam.ts', 'utf8');

const hymnals = [
  { code: 'GG2013', name: 'Gather Comprehensive Second Edition', file: 'gg2013' },
  { code: 'UMH', name: 'United Methodist Hymnal', file: 'umh' },
  { code: 'LSB2006', name: 'Lutheran Service Book', file: 'lsb2006' },
  { code: 'BH1991', name: 'Baptist Hymnal', file: 'bh1991' },
  { code: 'AAHH2001', name: 'African American Heritage Hymnal', file: 'aahh2001' },
  { code: 'CBoW1994', name: 'Common Book of Worship', file: 'cbow1994' },
];

for (const hymnal of hymnals) {
  const content = template
    .replace(/CPAM2000/g, hymnal.code)
    .replace(/Church Praise & Music/g, hymnal.name)
    .replace(/cpam/g, hymnal.file);

  writeFileSync(`scripts/import-${hymnal.file}.ts`, content);
  console.log(`Created scripts/import-${hymnal.file}.ts`);
}

console.log('All scripts generated successfully!');
