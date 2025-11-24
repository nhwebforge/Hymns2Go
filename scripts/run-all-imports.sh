#!/bin/bash

# Run all hymnal imports sequentially
# This will take several hours to complete

echo "========================================"
echo "Starting all hymnal imports..."
echo "========================================"
echo ""

# Array of scripts to run
scripts=(
  "import-cpam.ts"
  "import-gg2013.ts"
  "import-umh.ts"
  "import-lsb2006.ts"
  "import-bh1991.ts"
  "import-aahh2001.ts"
  "import-cbow1994.ts"
)

for script in "${scripts[@]}"; do
  echo ""
  echo "========================================"
  echo "Running: $script"
  echo "========================================"
  npx tsx "scripts/$script"

  if [ $? -eq 0 ]; then
    echo "✓ $script completed successfully"
  else
    echo "✗ $script failed"
  fi

  echo ""
  echo "Waiting 5 seconds before next import..."
  sleep 5
done

echo ""
echo "========================================"
echo "All imports complete!"
echo "========================================"

# Show final count
npx tsx scripts/count-hymns.ts
