/**
 * Test script to inspect Hymnary HTML structure
 */

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
  const url = `${BASE_URL}/hymn/${HYMNAL_CODE}/2`;
  console.log(`Fetching: ${url}\n`);

  const html = await fetchHTML(url);

  // Find all h2 tags
  const h2Matches = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)];
  console.log('=== All H2 tags ===');
  h2Matches.forEach((match, i) => {
    console.log(`${i + 1}. "${match[1].trim()}"`);
  });

  // Find all h1 tags
  const h1Matches = [...html.matchAll(/<h1[^>]*>([^<]+)<\/h1>/g)];
  console.log('\n=== All H1 tags ===');
  h1Matches.forEach((match, i) => {
    console.log(`${i + 1}. "${match[1].trim()}"`);
  });

  // Look for the text section
  const textMatch = html.match(/<div[^>]*id="text"[^>]*>([\s\S]{0,500})/);
  console.log('\n=== First 500 chars of text section ===');
  console.log(textMatch ? textMatch[1] : 'NOT FOUND');

  // Look for dt/dd pairs for metadata
  console.log('\n=== Metadata fields (dt/dd pairs) ===');
  const dtMatches = [...html.matchAll(/<dt[^>]*>([^<]+)<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/g)];
  dtMatches.forEach((match) => {
    console.log(`${match[1].trim()}: ${match[2].trim()}`);
  });
}

main().catch(console.error);
