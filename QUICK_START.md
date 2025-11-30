# Quick Start Guide - Morning After Import

## First Things First

### 1. Check if import is still running
```bash
ps aux | grep "import-all-improved"
```

If running: Let it finish (check progress below)
If finished: Continue to step 2

### 2. Check import progress
```bash
# See the last 50 lines
tail -50 import-log.txt

# Or watch it live (if still running)
tail -f import-log.txt
```

Look for lines like:
- `[184/411]` = Progress through current hymnal
- `IMPORTING: Ancient & Modern` = Current hymnal being processed
- `IMPORT COMPLETE` = All done!

### 3. When import finishes, verify quality
```bash
npx tsx scripts/verify-import-quality.ts
```

This will show:
- ✅ License issues (should be 0)
- ✅ Duplicates (should be minimal)
- ℹ️ Total hymns imported
- ℹ️ Breakdown by source

### 4. Import praise.org.uk (optional)
```bash
npx tsx scripts/import-praise.ts
```

Then verify again:
```bash
npx tsx scripts/verify-import-quality.ts
```

### 5. Update catalogue titles
```bash
npx tsx scripts/populate-catalogue-titles.ts
npx tsx scripts/populate-lowercase-titles.ts
```

### 6. Test the website
Visit: http://localhost:3000/hymns

Check:
- ✅ Alphabet navigation works
- ✅ Search works
- ✅ No duplicate entries
- ✅ Hymn text is complete (not license text)
- ✅ "Remove punctuation" checkbox works

## Key Numbers to Expect

**Old system:** 2,692 hymns (with 330 license issues, many duplicates)

**New system:** ~2,000-2,500 unique hymns
- Fewer because duplicates removed
- Higher quality
- All with source URLs
- No license issues

## If Something Went Wrong

### Import failed
Check the end of `import-log.txt` for errors:
```bash
tail -100 import-log.txt
```

### Too many/few duplicates
Edit threshold in `/lib/import-utils/duplicate-detector.ts`:
```typescript
threshold: number = 0.85  // Adjust this (0.80-0.95)
```

### License text found
Run this to see which hymns:
```bash
npx tsx scripts/check-license-hymns.ts
```

## All Documentation

- `OVERNIGHT_WORK_SUMMARY.md` - What was done overnight
- `IMPORT_SUMMARY.md` - Technical details
- `scripts/README.md` - How to manage imports
- `import-log.txt` - Import log (check this first!)

## Questions?

Read `OVERNIGHT_WORK_SUMMARY.md` - it has a FAQ section.
