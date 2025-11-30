# Hymn Import System - Complete Overhaul

## Summary

I've completely rebuilt the hymn import system with the following improvements:

### 1. Schema Changes

**Added `sourceUrl` field** to track where each hymn was imported from:
- Migration created: `20251125015318_add_source_url`
- All future imports will store the original URL
- Enables re-fetching hymns if needed

### 2. Intelligent Duplicate Detection

Created `/lib/import-utils/duplicate-detector.ts` with advanced fuzzy matching:

**Strategies used:**
- Exact title match with similar author (>80% similarity)
- Very similar titles (>90%) with same author
- Same first line with similar title
- Same first line with same author (even if title differs)

**Author normalization:**
- Removes birth/death dates: `(1707-1788)`, `(b. 1707)`, `(d. 1788)`
- Removes middle initials: `John Q. Smith` → `John Smith`
- Standardizes punctuation and spacing

**Example:**
- `Henry Francis Lyte (1793-1847)` matches `Henry Francis Lyte, 1793-1847`
- Prevents the "Abide with me" problem with 7 duplicate entries

### 3. License Agreement Handling

Created `/lib/import-utils/hymnary-importer.ts` base class:

**Features:**
- Sends `Cookie: license_agreement_accepted=1` header to hymnary.org
- Detects license agreement text in hymn content
- Skips hymns with "To view this media" or "license agreement" text
- Reports these as "license issues" in the import summary

This prevents the 330 hymns with garbage license text that occurred previously.

### 4. Praise.org.uk Import

Created `/scripts/import-praise.ts` for the new source:

**Features:**
- Parses JSON-LD structured data for metadata
- Handles verse numbering (verse 1 has no number)
- Identifies italicized text as refrains
- Extracts themes, tune information, copyright, CCLI numbers
- Uses the same duplicate detection system

**Note:** The website uses JavaScript rendering, so the script uses cheerio for HTML parsing.

### 5. Master Import Script

Created `/scripts/import-all-improved.ts` to import from all sources:

**Hymnals included:**
1. Complete Anglican Hymns Old and New (CAH2000)
2. Ancient & Modern (AM2013)
3. The New English Hymnal (NEH1985)
4. Church Praise & Music (CPAM2000)
5. Gather Comprehensive Second Edition (GG2013)
6. United Methodist Hymnal (UMH)
7. Lutheran Service Book (LSB2006)
8. Baptist Hymnal (BH1991)
9. African American Heritage Hymnal (AAHH2001)
10. Complete Book of Worship (CBOW1994)

**Process:**
- Imports each hymnal sequentially
- Maintains running list of existing hymns for duplicate detection
- Cross-hymnal duplicate detection (prevents same hymn from multiple sources)
- Continues on error (doesn't fail entire import if one hymnal has issues)

### 6. Import Verification

Created `/scripts/verify-import-quality.ts` to check:

**Checks performed:**
- ✅ No hymns with license agreement text
- ✅ No duplicate hymns (with detailed reporting)
- ℹ️ Missing metadata statistics (author, first line, source URL)
- ℹ️ Summary by source (hymn count per hymnal)

**Output example:**
```
Title: "Abide with me"
  Instances: 2
    - "Abide with me" by Henry Francis Lyte (1793-1847) (CAH2000)
    - "Abide with me" by Henry Francis Lyte, 1793-1847 (AM2013)
  Reason: Exact title match with similar author (95% confidence)
```

### 7. Cleanup Script

Created `/scripts/delete-all-hymns.ts`:
- Deletes all hymns, tags, and relationships
- 3-second warning before deletion
- Use before running full reimport

## Current Status

**Import is running** (started at 01:58 UTC)

The import is currently processing all 10 hymnals from hymnary.org. Early results show:

✅ Duplicate detection is working:
- "All things bright and beautiful" - detected duplicate variant (25b)
- "And now, O Father, mindful of the love" - detected duplicate variant (34b)

✅ License agreement handling is working:
- No hymns with "To view this media, please accept the license agreement" text being imported

The import will take several hours to complete (411 hymns from first hymnal alone, ~10 hymnals total).

## Next Steps

After the hymnary.org import completes:

1. Run praise.org.uk import:
   ```bash
   npx tsx scripts/import-praise.ts
   ```

2. Verify import quality:
   ```bash
   npx tsx scripts/verify-import-quality.ts
   ```

3. Check the results and manually review any reported issues

## Files Created/Modified

### New Files:
- `/lib/import-utils/duplicate-detector.ts` - Fuzzy duplicate detection
- `/lib/import-utils/hymnary-importer.ts` - Base class for hymnary imports
- `/scripts/import-praise.ts` - Praise.org.uk import script
- `/scripts/import-all-improved.ts` - Master import script
- `/scripts/delete-all-hymns.ts` - Cleanup utility
- `/scripts/verify-import-quality.ts` - Quality verification
- `import-log.txt` - Live import log (being written)

### Modified Files:
- `/prisma/schema.prisma` - Added `sourceUrl` field
- Database - Migration applied for new field

## Technical Notes

### Duplicate Detection Threshold
- Default threshold: 85% confidence
- Adjustable in the code if needed
- Higher threshold = fewer duplicates detected (more strict)
- Lower threshold = more duplicates detected (more aggressive)

### Import Rate Limiting
- 1 second delay between requests (hymnary.org)
- 1.5 second delay for praise.org.uk
- Respectful to server resources
- Prevents rate limiting/blocking

### Error Handling
- Individual hymn errors don't stop the import
- Hymnal-level errors allow continuing with next hymnal
- All errors logged to console and `import-log.txt`

### Database Updates
- Each hymn is created with all metadata in one transaction
- Tags are upserted (created if new, reused if existing)
- Hymn-tag relationships use upsert to prevent duplicates
- Existing hymns list updated after each hymnal for cross-hymnal duplicate detection
