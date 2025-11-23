/**
 * Test script to check AM2013 HTML structure
 */

async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });
  return response.text();
}

async function main() {
  // Try a hymn that should have text
  const url = 'https://hymnary.org/hymn/AM2013/5';
  console.log(`Fetching: ${url}`);

  const html = await fetchHTML(url);

  // Look for text div
  const textMatch = html.match(/<div class="hy_text"[^>]*>([\s\S]*?)<\/div>/);
  console.log('\nText div match:', textMatch ? 'FOUND' : 'NOT FOUND');

  if (textMatch) {
    console.log('\nFirst 500 chars of text div:');
    console.log(textMatch[1].substring(0, 500));
  }

  // Look for any div that might contain hymn text
  console.log('\n\nSearching for text containers...');
  const divMatches = html.match(/<div[^>]*class="[^"]*text[^"]*"[^>]*>/g);
  if (divMatches) {
    console.log('Found divs with "text" in class:');
    divMatches.forEach(m => console.log('  ', m));
  }

  // Save full HTML for inspection
  console.log('\n\nSaving full HTML to test-am-output.html');
  const fs = await import('fs/promises');
  await fs.writeFile('test-am-output.html', html, 'utf-8');
}

main().catch(console.error);
