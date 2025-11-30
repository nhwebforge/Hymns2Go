const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

function getAllPaths(obj: any, parentPath = ''): Map<string, any> {
  const paths = new Map();

  if (obj === null || obj === undefined) {
    paths.set(parentPath, obj);
    return paths;
  }

  if (typeof obj !== 'object') {
    paths.set(parentPath, obj);
    return paths;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const itemPath = parentPath ? `${parentPath}[${index}]` : `[${index}]`;
      const subPaths = getAllPaths(item, itemPath);
      subPaths.forEach((value, key) => paths.set(key, value));
    });
  } else {
    Object.keys(obj).forEach(key => {
      const fullPath = parentPath ? `${parentPath}.${key}` : key;
      const subPaths = getAllPaths(obj[key], fullPath);
      subPaths.forEach((value, key) => paths.set(key, value));
    });
  }

  return paths;
}

async function compare() {
  const protoPath = path.join(process.cwd(), 'lib', 'proto');
  const root = await protobuf.load([
    path.join(protoPath, 'presentation.proto'),
  ]);

  const PresentationType = root.lookupType('rv.data.Presentation');

  const bufferDownloaded = fs.readFileSync('/Users/nicholasharvey/Downloads/_Glory_to_God___all_heav_n_with_joy_is_ringing.pro');
  const messageDownloaded = PresentationType.decode(bufferDownloaded);
  const objDownloaded = PresentationType.toObject(messageDownloaded);

  const bufferManual = fs.readFileSync('/Users/nicholasharvey/Documents/ProPresenter/Libraries/Hymns/_Glory_to_God___all_heav_n_with_joy_is_ringing.pro');
  const messageManual = PresentationType.decode(bufferManual);
  const objManual = PresentationType.toObject(messageManual);

  // Get slide 2
  const downloadedSlide = objDownloaded.cues[1].actions[0].slide.presentation.baseSlide;
  const manualSlide = objManual.cues[1].actions[0].slide.presentation.baseSlide;

  console.log('=== GETTING ALL PATHS ===\n');
  const downloadedPaths = getAllPaths(downloadedSlide);
  const manualPaths = getAllPaths(manualSlide);

  console.log(`Downloaded file has ${downloadedPaths.size} unique paths`);
  console.log(`Manual file has ${manualPaths.size} unique paths\n`);

  const allKeys = new Set([...downloadedPaths.keys(), ...manualPaths.keys()]);

  const differences: string[] = [];

  for (const key of allKeys) {
    const downloadedValue = downloadedPaths.get(key);
    const manualValue = manualPaths.get(key);

    if (!downloadedPaths.has(key)) {
      differences.push(`ONLY IN MANUAL: ${key} = ${JSON.stringify(manualValue)}`);
    } else if (!manualPaths.has(key)) {
      differences.push(`ONLY IN DOWNLOADED: ${key} = ${JSON.stringify(downloadedValue)}`);
    } else if (downloadedValue !== manualValue) {
      differences.push(`DIFFERENT: ${key}\n  DOWNLOADED: ${JSON.stringify(downloadedValue)}\n  MANUAL: ${JSON.stringify(manualValue)}`);
    }
  }

  console.log(`\n=== FOUND ${differences.length} DIFFERENCES ===\n`);
  differences.forEach(d => console.log(d + '\n'));
}

compare();
