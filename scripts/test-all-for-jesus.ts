/**
 * Test extraction for "All for Jesus" hymn
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
  // Search for "All for Jesus" in AM2013
  const searchUrl = 'https://hymnary.org/hymn/AM2013/page/fetch';

  // Let's try a direct approach - check a few hymns to find "All for Jesus"
  // It's likely an early hymn number
  for (let num of [1, 2, 3, 4, 6, 7, 9, 10]) {
    const url = `https://hymnary.org/hymn/AM2013/${num}`;
    console.log(`\nChecking: ${url}`);

    const html = await fetchHTML(url);

    // Check title
    const titleMatch = html.match(/<h1[^>]*itemprop="name"[^>]*>([^<]+)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : 'NO TITLE';

    if (title.includes('All for Jesus')) {
      console.log('\n=== FOUND IT! ===');
      console.log('Title:', title);

      // Look for the full metadata section
      console.log('\n=== RAW AUTHOR SECTION (500 chars) ===');
      const authorSection = html.match(/hy_infoLabel">Author:?<\/span>[\s\S]{0,500}/);
      if (authorSection) {
        console.log(authorSection[0]);
      }

      // Try extraction
      const extractField = (label: string): string | null => {
        const pattern = new RegExp(`<span class="hy_infoLabel">${label}:?</span>.*?<span class="hy_infoItem">(?:<a[^>]*>)?([^<]+)(?:</a>)?</span>`, 'is');
        const match = html.match(pattern);
        if (!match) return null;

        let value = match[1].trim();
        value = value.replace(/[,.]$/, '');
        return value;
      };

      console.log('\n=== EXTRACTED VALUES ===');
      console.log('Author:', extractField('Author'));
      console.log('Meter:', extractField('Meter'));
      console.log('First Line:', extractField('First Line'));

      // Save full HTML for inspection
      const fs = await import('fs/promises');
      await fs.writeFile('test-all-for-jesus.html', html, 'utf-8');
      console.log('\nSaved full HTML to test-all-for-jesus.html');

      break;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

main().catch(console.error);
