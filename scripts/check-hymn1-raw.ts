/**
 * Check raw HTML for AM2013 hymn #1
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
  const url = 'https://hymnary.org/hymn/AM2013/1';
  console.log(`Fetching: ${url}\n`);

  const html = await fetchHTML(url);

  // Look for author in various patterns
  console.log('=== SEARCHING FOR AUTHOR PATTERNS ===\n');

  // Pattern 1: hy_infoLabel (what we're currently using)
  const pattern1 = html.match(/hy_infoLabel">Author:?<\/span>[\s\S]{0,300}/);
  console.log('Pattern 1 (hy_infoLabel):');
  console.log(pattern1 ? pattern1[0] : 'NOT FOUND');
  console.log('');

  // Pattern 2: <strong>Author:</strong>
  const pattern2 = html.match(/<strong>Author:?<\/strong>[\s\S]{0,300}/);
  console.log('Pattern 2 (<strong>):');
  console.log(pattern2 ? pattern2[0] : 'NOT FOUND');
  console.log('');

  // Pattern 3: Search for "Thomas Ken" directly
  const pattern3 = html.match(/Thomas Ken[\s\S]{0,100}/);
  console.log('Pattern 3 (Thomas Ken directly):');
  console.log(pattern3 ? pattern3[0] : 'NOT FOUND');
  console.log('');

  // Save a larger sample around metadata
  const fs = await import('fs/promises');

  // Find the info table/section
  const infoSection = html.match(/<div[^>]*class="[^"]*info[^"]*"[^>]*>[\s\S]{0,5000}<\/div>|<table[^>]*>[\s\S]{0,5000}<\/table>/);
  if (infoSection) {
    await fs.writeFile('hymn1-info-section.html', infoSection[0], 'utf-8');
    console.log('Saved info section to hymn1-info-section.html');
  }

  // Try current extraction method
  const extractField = (label: string): string | null => {
    const pattern = new RegExp(`<span class="hy_infoLabel">${label}:?</span>.*?<span class="hy_infoItem">(?:<a[^>]*>)?([^<]+)(?:</a>)?</span>`, 'is');
    const match = html.match(pattern);
    if (!match) return null;

    let value = match[1].trim();
    value = value.replace(/[,.]$/, '');
    return value;
  };

  console.log('\n=== CURRENT EXTRACTION METHOD ===');
  console.log('Author:', extractField('Author'));
  console.log('Meter:', extractField('Meter'));
  console.log('First Line:', extractField('First Line'));
}

main().catch(console.error);
