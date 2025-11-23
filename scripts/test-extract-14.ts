/**
 * Test extraction of hymn #14 metadata
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

  const extractField = (label: string): string | null => {
    const pattern = new RegExp(`<span class="hy_infoLabel">${label}:?</span>.*?<span class="hy_infoItem">(?:<a[^>]*>)?([^<]+)(?:</a>)?</span>`, 'is');
    const match = html.match(pattern);
    if (!match) return null;

    let value = match[1].trim();
    value = value.replace(/[,.]$/, '');
    return value;
  };

  console.log('=== Extracted Metadata ===');
  console.log('Title:', extractField('Title'));
  console.log('Latin Title:', extractField('Latin Title'));
  console.log('Author:', extractField('Author'));
  console.log('Translator:', extractField('Translator'));
  console.log('First Line:', extractField('First Line'));
  console.log('Refrain First Line:', extractField('Refrain First Line'));
  console.log('Meter:', extractField('Meter'));
  console.log('Language:', extractField('Language'));
  console.log('Publication Date:', extractField('Publication Date'));
}

main().catch(console.error);
