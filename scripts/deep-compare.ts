const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

async function deepCompare() {
  const protoPath = path.join(process.cwd(), 'lib', 'proto');
  const root = await protobuf.load([
    path.join(protoPath, 'presentation.proto'),
  ]);

  const PresentationType = root.lookupType('rv.data.Presentation');

  const bufferDownloaded = fs.readFileSync('/Users/nicholasharvey/Downloads/All_praise_to_thee__for_thou__O_King_divine (1).pro');
  const messageDownloaded = PresentationType.decode(bufferDownloaded);
  const objDownloaded = PresentationType.toObject(messageDownloaded);

  const bufferManual = fs.readFileSync('/Users/nicholasharvey/Documents/ProPresenter/Libraries/Hymns/All_praise_to_thee__for_thou__O_King_divine (1).pro');
  const messageManual = PresentationType.decode(bufferManual);
  const objManual = PresentationType.toObject(messageManual);

  // Find Verse 1 first slide
  const downloadedVerse1Group = objDownloaded.cueGroups.find(g => g.group.name === 'Verse 1');
  const downloadedVerse1FirstCueId = downloadedVerse1Group?.cueIdentifiers[0]?.string;
  const downloadedSlideIndex = objDownloaded.cues.findIndex(c => c.uuid.string === downloadedVerse1FirstCueId);

  const manualVerse1Group = objManual.cueGroups.find(g => g.group.name === 'Verse 1');
  const manualVerse1FirstCueId = manualVerse1Group?.cueIdentifiers[0]?.string;
  const manualSlideIndex = objManual.cues.findIndex(c => c.uuid.string === manualVerse1FirstCueId);

  console.log('=== COMPARING VERSE 1 FIRST SLIDE ===');
  console.log('Downloaded slide index:', downloadedSlideIndex);
  console.log('Manual slide index:', manualSlideIndex);

  const downloadedSlide = objDownloaded.cues[downloadedSlideIndex];
  const manualSlide = objManual.cues[manualSlideIndex];

  // Save both complete slides to JSON for deep inspection
  fs.writeFileSync('/tmp/downloaded-slide.json', JSON.stringify(downloadedSlide, null, 2));
  fs.writeFileSync('/tmp/manual-slide.json', JSON.stringify(manualSlide, null, 2));

  console.log('\n=== SAVED COMPLETE SLIDES TO JSON ===');
  console.log('Downloaded: /tmp/downloaded-slide.json');
  console.log('Manual: /tmp/manual-slide.json');

  const downloadedElement = downloadedSlide.actions[0].slide.presentation.baseSlide.elements[0];
  const manualElement = manualSlide.actions[0].slide.presentation.baseSlide.elements[0];

  console.log('\n=== COMPARING ELEMENT WRAPPER ===');
  console.log('Downloaded element keys:', Object.keys(downloadedElement));
  console.log('Manual element keys:', Object.keys(manualElement));

  console.log('\n=== DOWNLOADED ELEMENT ===');
  console.log(JSON.stringify(downloadedElement.element, null, 2).substring(0, 1000));

  console.log('\n=== MANUAL ELEMENT ===');
  console.log(JSON.stringify(manualElement.element, null, 2).substring(0, 1000));

  // Compare ALL fields
  function compareObjects(obj1: any, obj2: any, path: string = '') {
    const keys1 = Object.keys(obj1 || {});
    const keys2 = Object.keys(obj2 || {});

    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key;

      if (!keys1.includes(key)) {
        console.log(`❌ Missing in downloaded: ${newPath}`);
      } else if (!keys2.includes(key)) {
        console.log(`❌ Missing in manual: ${newPath}`);
      } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && obj1[key] !== null && obj2[key] !== null) {
        if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          compareObjects(obj1[key], obj2[key], newPath);
        }
      } else if (obj1[key] !== obj2[key]) {
        console.log(`❌ Different at ${newPath}:`);
        console.log(`   Downloaded: ${JSON.stringify(obj1[key])}`);
        console.log(`   Manual: ${JSON.stringify(obj2[key])}`);
      }
    }
  }

  console.log('\n=== DEEP COMPARISON OF ELEMENTS ===');
  compareObjects(downloadedElement, manualElement, 'element');
}

deepCompare();
