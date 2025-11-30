# Hymn Import Scripts - Quick Reference

## Complete Reimport (Nuclear Option)

When you need to start fresh and reimport everything:

```bash
# 1. Delete all existing hymns
npx tsx scripts/delete-all-hymns.ts

# 2. Import from all hymnary.org sources
npx tsx scripts/import-all-improved.ts

# 3. Import from praise.org.uk
npx tsx scripts/import-praise.ts

# 4. Verify the import quality
npx tsx scripts/verify-import-quality.ts
```

**Time estimate:** 2-4 hours for complete import

## Individual Hymnal Import

To import from a specific hymnal only:

```bash
# Using the shared importer utility
npx tsx scripts/import-[hymnal].ts
```

**Available hymnals:**
- `import-am2013.ts` - Ancient & Modern
- `import-neh.ts` - New English Hymnal
- `import-cpam.ts` - Church Praise & Music
- `import-gg2013.ts` - Gather Comprehensive
- `import-umh.ts` - United Methodist Hymnal
- `import-lsb2006.ts` - Lutheran Service Book
- `import-bh1991.ts` - Baptist Hymnal
- `import-aahh2001.ts` - African American Heritage Hymnal
- `import-cbow1994.ts` - Complete Book of Worship

**Note:** These individual scripts should be updated to use the new `HymnaryImporter` base class for consistency.

## Verification & Quality Checks

### Check for duplicates and license issues
```bash
npx tsx scripts/verify-import-quality.ts
```

This will report:
- Hymns with license agreement text
- Potential duplicate hymns with confidence scores
- Missing metadata statistics
- Summary by source

### Check specific hymn by ID
```bash
npx tsx scripts/check-license-hymns.ts
```

This searches for hymns containing "license" in their text.

## Understanding the Duplicate Detector

### Confidence Levels

- **95%+**: Exact title match with same author - Definitely a duplicate
- **90-94%**: Very similar title with same author - Almost certainly a duplicate
- **85-89%**: Same first line with similar title, or same author - Likely duplicate
- **<85%**: Not considered a duplicate (below threshold)

### Adjusting Duplicate Detection

Edit `/lib/import-utils/duplicate-detector.ts` and modify the `isDuplicate` function:

```typescript
// Current threshold
export function isDuplicate(
  newHymn: HymnForComparison,
  existingHymns: HymnForComparison[],
  threshold: number = 0.85  // <-- Change this
): boolean {
```

**Higher threshold (0.90)**: Fewer duplicates detected, more hymns imported
**Lower threshold (0.80)**: More duplicates detected, fewer hymns imported

## License Agreement Issues

### How it Works

The import system:
1. Sends `Cookie: license_agreement_accepted=1` to hymnary.org
2. Checks hymn text for "license agreement" or "To view this media"
3. Skips hymns with this text
4. Reports them as "license issues" in the summary

### If Hymns Still Have License Text

If you find hymns with license agreement text after import:

1. Check if the cookie is being sent properly in `/lib/import-utils/hymnary-importer.ts`
2. Verify the detection logic in `hasLicenseText()` method
3. The hymn may be publicly unavailable on hymnary.org

## Monitoring Long-Running Imports

### Check progress in real-time
```bash
tail -f import-log.txt
```

### Count imported hymns
```bash
npx tsx -e "import { prisma } from './lib/db/prisma'; prisma.hymn.count().then(console.log).finally(() => prisma.\$disconnect())"
```

### Get summary by source
```bash
npx tsx -e "
import { prisma } from './lib/db/prisma';
const hymns = await prisma.hymn.groupBy({
  by: ['hymnalCode'],
  _count: true
});
console.table(hymns);
await prisma.\$disconnect();
"
```

## Common Issues & Solutions

### Issue: Too Many Duplicates Being Detected

**Solution:** Increase the threshold in `duplicate-detector.ts` (e.g., from 0.85 to 0.90)

### Issue: Not Enough Duplicates Detected

**Solution:**
1. Lower the threshold (e.g., from 0.85 to 0.80)
2. Check if author normalization is working (`normalizeAuthorName` function)
3. Verify firstLine extraction is working

### Issue: Import Fails Midway

**Solution:**
1. Check `import-log.txt` for the specific error
2. The import should continue with the next hymnal
3. You can reimport just the failed hymnal individually

### Issue: Hymns With Wrong Metadata

**Solution:**
1. Check the source URL in the database to see the original page
2. Verify the parsing logic in `hymnary-importer.ts`
3. Hymnary.org may have inconsistent HTML structure for some hymns

## Database Queries

### Find hymns from a specific source
```sql
SELECT title, author, hymnalCode, hymnalNumber
FROM "Hymn"
WHERE "hymnalCode" = 'CAH2000'
ORDER BY "catalogueTitleLower";
```

### Find hymns without source URL
```sql
SELECT COUNT(*)
FROM "Hymn"
WHERE "sourceUrl" IS NULL;
```

### Find duplicate titles
```sql
SELECT title, author, COUNT(*) as count
FROM "Hymn"
GROUP BY title, author
HAVING COUNT(*) > 1
ORDER BY count DESC;
```

## Best Practices

1. **Always verify after import** - Run `verify-import-quality.ts`
2. **Keep import logs** - Save `import-log.txt` for troubleshooting
3. **Test with one hymnal first** - Before running the full import
4. **Monitor the first 50 hymns** - Catch issues early
5. **Check duplicate detection** - Ensure it's not too aggressive or too lenient

## Future Improvements

Ideas for enhancing the import system:

1. **Resume capability** - Save progress and resume from where it left off
2. **Incremental updates** - Only import new/changed hymns
3. **Parallel imports** - Import multiple hymnals concurrently
4. **Better error recovery** - Retry failed hymns with exponential backoff
5. **Automated verification** - Run quality checks during import, not just after
6. **More sources** - Add other hymn websites beyond hymnary.org and praise.org.uk
