/**
 * Save HTML of hymn #14 to file for inspection
 */

import { writeFileSync } from 'fs';

const HYMNAL_CODE = 'CAH2000';
const BASE_URL = 'https://hymnary.org';

async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
  return response.text();
}

async function main() {
  const url = `${BASE_URL}/hymn/${HYMNAL_CODE}/14`;
  console.log(`Fetching: ${url}\n`);

  const html = await fetchHTML(url);

  writeFileSync('/tmp/hymn-14.html', html);
  console.log('Saved to /tmp/hymn-14.html');

  // Look for any mentions of "Theodulph" (the author) or "Neale" (the translator)
  const authorMatches = [...html.matchAll(/Theodulph/gi)];
  const translatorMatches = [...html.matchAll(/Neale/gi)];

  console.log(`\nFound ${authorMatches.length} mentions of "Theodulph"`);
  console.log(`Found ${translatorMatches.length} mentions of "Neale"`);

  // Show some context around first mention
  if (authorMatches.length > 0) {
    const index = html.indexOf('Theodulph');
    console.log('\nContext around first "Theodulph":');
    console.log(html.substring(Math.max(0, index - 200), Math.min(html.length, index + 200)));
  }
}

main().catch(console.error);
