/**
 * Test script to examine AM2013 metadata extraction
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
  // "Awake my soul and with the sun" - user mentioned this one
  // Let's try hymn 5 which should be a common morning hymn
  const url = 'https://hymnary.org/hymn/AM2013/5';
  console.log(`Fetching: ${url}`);

  const html = await fetchHTML(url);

  // Look for title
  const titleMatch = html.match(/<h1[^>]*itemprop="name"[^>]*>([^<]+)<\/h1>/);
  console.log('\n=== TITLE ===');
  console.log(titleMatch ? titleMatch[1] : 'NOT FOUND');

  // Look for author section in the HTML
  console.log('\n=== AUTHOR SECTION ===');
  const authorSection = html.match(/hy_infoLabel">Author:?<\/span>[\s\S]{0,500}hy_infoItem/);
  if (authorSection) {
    console.log('Found author section:');
    console.log(authorSection[0]);
  } else {
    console.log('Author section NOT FOUND');
  }

  // Look for meter section in the HTML
  console.log('\n=== METER SECTION ===');
  const meterSection = html.match(/hy_infoLabel">Meter:?<\/span>[\s\S]{0,500}hy_infoItem/);
  if (meterSection) {
    console.log('Found meter section:');
    console.log(meterSection[0]);
  } else {
    console.log('Meter section NOT FOUND');
  }

  // Look for first line section in the HTML
  console.log('\n=== FIRST LINE SECTION ===');
  const firstLineSection = html.match(/hy_infoLabel">First Line:?<\/span>[\s\S]{0,500}hy_infoItem/);
  if (firstLineSection) {
    console.log('Found first line section:');
    console.log(firstLineSection[0]);
  } else {
    console.log('First Line section NOT FOUND');
  }

  // Try extraction with current pattern
  const extractField = (label: string): string | null => {
    const pattern = new RegExp(`<span class="hy_infoLabel">${label}:?</span>.*?<span class="hy_infoItem">(?:<a[^>]*>)?([^<]+)(?:</a>)?</span>`, 'is');
    const match = html.match(pattern);
    if (!match) return null;

    let value = match[1].trim();
    value = value.replace(/[,.]$/, '');
    return value;
  };

  console.log('\n=== EXTRACTED VALUES (current method) ===');
  console.log('Author:', extractField('Author'));
  console.log('Meter:', extractField('Meter'));
  console.log('First Line:', extractField('First Line'));
  console.log('Translator:', extractField('Translator'));

  // Save a portion of the HTML around the metadata table
  console.log('\n=== SAVING HTML SAMPLE ===');
  const tableMatch = html.match(/<table[^>]*class="[^"]*hymn-info[^"]*"[^>]*>[\s\S]{0,3000}<\/table>/);
  if (tableMatch) {
    const fs = await import('fs/promises');
    await fs.writeFile('test-am-metadata.html', tableMatch[0], 'utf-8');
    console.log('Saved metadata table to test-am-metadata.html');
  } else {
    console.log('Could not find metadata table');
  }
}

main().catch(console.error);
