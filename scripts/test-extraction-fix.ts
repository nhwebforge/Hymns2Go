/**
 * Test the fixed extraction logic on real hymn pages
 */

async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });
  return response.text();
}

function extractTitle(html: string, hymnNumber: string): string {
  // Try h2 with hymn number prefix: "811. Thou didst leave thy throne..."
  const h2Pattern = new RegExp(`<h2[^>]*>\\s*${hymnNumber}\\.\\s*([^<]+)</h2>`);
  const h2Match = html.match(h2Pattern);
  if (h2Match) {
    return h2Match[1].trim();
  }

  // Try h2 with hymn number and letter prefix: "14a. All glory, laud and honour"
  const h2LetterPattern = new RegExp(`<h2[^>]*>\\s*${hymnNumber}[a-z]?\\.\\s*([^<]+)</h2>`);
  const h2LetterMatch = html.match(h2LetterPattern);
  if (h2LetterMatch) {
    return h2LetterMatch[1].trim();
  }

  // Fallback: look for hy_infoLabel Title field
  const titlePattern = /<span class="hy_infoLabel">Title:?<\/span><\/td>\s*<td><span class="hy_infoItem">([^<]+)<\/span>/i;
  const titleMatch = html.match(titlePattern);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Last resort
  return `Hymn ${hymnNumber}`;
}

function extractField(html: string, label: string): string | null {
  // Pattern 1: hy_infoLabel (detailed section)
  const pattern1 = new RegExp(
    `<span class="hy_infoLabel">${label}:?</span></td>\\s*<td><span class="hy_infoItem">(.*?)</span>`,
    'is'
  );
  const match1 = html.match(pattern1);
  if (match1) {
    let value = match1[1]
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .trim();
    value = value.replace(/\s*\([^)]*alt\.\)\s*$/i, ''); // Remove (alt.) suffix
    return value || null;
  }

  // Pattern 2: <strong> tags (infoBubble section)
  const pattern2 = new RegExp(
    `<strong>${label}:?</strong>\\s*(?:</td>\\s*<td>)?\\s*(?:<a[^>]*>)?([^<]+)`,
    'i'
  );
  const match2 = html.match(pattern2);
  if (match2) {
    return match2[1].trim() || null;
  }

  return null;
}

async function testHymn(url: string, hymnNumber: string) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Testing: ${url}`);
  console.log('='.repeat(70));

  const html = await fetchHTML(url);

  console.log('\n📖 Extracted Metadata:');
  console.log(`  Title: "${extractTitle(html, hymnNumber)}"`);
  console.log(`  Author: "${extractField(html, 'Author')}"`);
  console.log(`  First Line: "${extractField(html, 'First Line')}"`);
  console.log(`  Meter: "${extractField(html, 'Meter')}"`);
  console.log(`  Translator: "${extractField(html, 'Translator')}"`);
  console.log(`  Refrain First Line: "${extractField(html, 'Refrain First Line')}"`);
  console.log(`  Tune Name: "${extractField(html, 'Name')}"`);
  console.log(`  Composer: "${extractField(html, 'Composer')}"`);
}

async function main() {
  // Test problematic hymns
  await testHymn('https://hymnary.org/hymn/AM2013/811', '811');
  await testHymn('https://hymnary.org/hymn/AM2013/1', '1');
  await testHymn('https://hymnary.org/hymn/CAH2000/2', '2');
  await testHymn('https://hymnary.org/hymn/CAH2000/14', '14');
}

main().catch(console.error);
