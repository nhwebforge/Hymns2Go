const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

function deepCompare(obj1: any, obj2: any, path = '', differences: string[] = []): string[] {
  const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

  for (const key of allKeys) {
    const newPath = path ? `${path}.${key}` : key;

    if (!(key in obj1)) {
      differences.push(`MISSING IN DOWNLOADED: ${newPath}`);
    } else if (!(key in obj2)) {
      differences.push(`MISSING IN MANUAL: ${newPath}`);
    } else if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
      deepCompare(obj1[key], obj2[key], newPath, differences);
    } else if (obj1[key] !== obj2[key]) {
      differences.push(`DIFFERENT: ${newPath} => DOWNLOADED: ${obj1[key]}, MANUAL: ${obj2[key]}`);
    }
  }

  return differences;
}

async function compare() {
  const protoPath = path.join(process.cwd(), 'lib', 'proto');
  const root = await protobuf.load([
    path.join(protoPath, 'presentation.proto'),
  ]);

  const PresentationType = root.lookupType('rv.data.Presentation');

  const bufferDownloaded = fs.readFileSync('/Users/nicholasharvey/Downloads/Be_thou_my_vision__O_Lord_of_my_heart.pro');
  const messageDownloaded = PresentationType.decode(bufferDownloaded);
  const objDownloaded = PresentationType.toObject(messageDownloaded);

  const bufferManual = fs.readFileSync('/Users/nicholasharvey/Documents/ProPresenter/Libraries/Hymns/Be_thou_my_vision__O_Lord_of_my_heart.pro');
  const messageManual = PresentationType.decode(bufferManual);
  const objManual = PresentationType.toObject(messageManual);

  const downloadedEl = objDownloaded.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element;
  const manualEl = objManual.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element;

  console.log('=== ALL DIFFERENCES IN SLIDE 2 ELEMENT ===\n');
  const diffs = deepCompare(downloadedEl, manualEl);

  if (diffs.length === 0) {
    console.log('NO DIFFERENCES FOUND!');
  } else {
    diffs.forEach(d => console.log(d));
  }
}

compare();
