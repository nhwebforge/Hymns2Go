async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });
  return response.text();
}

async function main() {
  const html = await fetchHTML('https://hymnary.org/hymn/AM2013/1');
  const fs = await import('fs/promises');

  // Find the hy_infoLabel table section
  const match = html.match(/<table[^>]*>([\s\S]*?hy_infoLabel[\s\S]*?)<\/table>/);
  if (match) {
    await fs.writeFile('hymn1-hy-info-table.html', match[0], 'utf-8');
    console.log('Saved hy_infoLabel table');

    // Also show first 2000 chars
    console.log('\n=== FIRST 2000 CHARS OF HY_INFO TABLE ===');
    console.log(match[0].substring(0, 2000));
  } else {
    console.log('Could not find hy_infoLabel table');
  }
}

main().catch(console.error);
