/**
 * Test the text formatting
 */

// Actual HTML from Hymnary has newlines after br tags
const testHTML = `<p>1 All for Jesus! All for Jesus!<br />

This our song shall ever be:<br />

for we have no hope nor Saviour<br />

if we have not hope in thee.<br /></p><p>2 All for Jesus! Thou wilt give us<br />

strength to serve thee, hour by hour,<br />

none can move us from thy presence,<br />

while we trust thy love and power.<br /></p>`;

let rawText = testHTML;

// Clean up HTML tags and entities
rawText = rawText
  .replace(/<br\s*\/?>\s*/gi, '\n')  // Replace br tags and trailing whitespace with single newline
  .replace(/<p[^>]*>/gi, '')
  .replace(/<\/p>/gi, '\n\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\r\n/g, '\n')
  .replace(/\r/g, '\n')
  .replace(/\n\n+/g, '\n\n')  // Collapse 3+ newlines to just 2
  .trim();

console.log('=== After cleanup ===');
console.log(rawText);
console.log('\n');

// Format
const formattedText = rawText
  .split(/\n\n+/)
  .map(paragraph => {
    const trimmed = paragraph.trim();
    if (!trimmed) return '';

    const verseMatch = trimmed.match(/^(\d+[a-z]?)\s+(.+)$/s);
    if (verseMatch) {
      return `${verseMatch[1]}\n${verseMatch[2]}`;
    }

    if (trimmed.toLowerCase().startsWith('chorus') ||
        trimmed.toLowerCase().startsWith('refrain')) {
      const content = trimmed.replace(/^(chorus|refrain)[:\s]*/i, '');
      return `Chorus\n${content}`;
    }

    return trimmed;
  })
  .filter(Boolean)
  .join('\n\n');

console.log('=== Final formatted ===');
console.log(formattedText);
