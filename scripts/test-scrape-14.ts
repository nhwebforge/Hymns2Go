/**
 * Test script to check hymn #14 "All glory laud and honour" HTML structure
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
  const url = `${BASE_URL}/hymn/${HYMNAL_CODE}/14`;
  console.log(`Fetching: ${url}\n`);

  const html = await fetchHTML(url);

  // Look for dt/dd pairs for metadata
  console.log('=== Metadata fields (dt/dd pairs) ===');
  const dtMatches = [...html.matchAll(/<dt[^>]*>([^<]+)<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/g)];
  dtMatches.forEach((match) => {
    console.log(`${match[1].trim()}: ${match[2].trim()}`);
  });

  console.log('\n=== First 500 chars of full metadata section ===');
  const metaMatch = html.match(/<dl[^>]*class="[^"]*song-meta[^"]*"[^>]*>([\s\S]{0,2000})<\/dl>/);
  if (metaMatch) {
    console.log(metaMatch[1]);
  }
}

main().catch(console.error);
