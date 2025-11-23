/**
 * Test script to check "All glory laud and honour" HTML structure
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
  // Find the hymn number first
  const indexUrl = `${BASE_URL}/hymnal/${HYMNAL_CODE}`;
  const html = await fetchHTML(indexUrl);

  // Look for "All glory" in the hymnal
  const match = html.match(/href="\/hymn\/CAH2000\/(\d+)"[^>]*>([^<]*All glory[^<]*)<\/a>/i);

  if (!match) {
    console.log('Hymn not found in index');
    return;
  }

  const hymnNumber = match[1];
  console.log(`Found hymn number: ${hymnNumber}`);
  console.log(`Title from index: ${match[2]}`);

  const url = `${BASE_URL}/hymn/${HYMNAL_CODE}/${hymnNumber}`;
  console.log(`\nFetching: ${url}\n`);

  const hymnHtml = await fetchHTML(url);

  // Look for the text section
  const textMatch = hymnHtml.match(/<div[^>]*id="text"[^>]*>([\s\S]*?)<\/div>/);
  console.log('=== Raw HTML text section ===');
  if (textMatch) {
    console.log(textMatch[1].substring(0, 1000));
  } else {
    console.log('NOT FOUND');
  }
}

main().catch(console.error);
