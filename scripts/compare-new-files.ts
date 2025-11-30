const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

async function compareNewFiles() {
  const protoPath = path.join(process.cwd(), 'lib', 'proto');
  const root = await protobuf.load([
    path.join(protoPath, 'presentation.proto'),
  ]);

  const PresentationType = root.lookupType('rv.data.Presentation');

  const bufferDownloaded = fs.readFileSync('/Users/nicholasharvey/Downloads/All_praise_to_thee__for_thou__O_King_divine.pro');
  const messageDownloaded = PresentationType.decode(bufferDownloaded);
  const objDownloaded = PresentationType.toObject(messageDownloaded);

  const bufferManual = fs.readFileSync('/Users/nicholasharvey/Documents/ProPresenter/Libraries/Hymns/All_praise_to_thee__for_thou__O_King_divine.pro');
  const messageManual = PresentationType.decode(bufferManual);
  const objManual = PresentationType.toObject(messageManual);

  console.log('=== FINDING FIRST VERSE 1 SLIDE IN BOTH FILES ===\n');

  // Find the cue group for "Verse 1" in downloaded file
  const downloadedVerse1Group = objDownloaded.cueGroups.find(g => g.group.name === 'Verse 1');
  const downloadedVerse1FirstCueId = downloadedVerse1Group?.cueIdentifiers[0]?.string;
  const downloadedVerse1SlideIndex = objDownloaded.cues.findIndex(c => c.uuid.string === downloadedVerse1FirstCueId);

  console.log('Downloaded Verse 1 first slide index:', downloadedVerse1SlideIndex);

  // Find the cue group for "Verse 1" in manual file
  const manualVerse1Group = objManual.cueGroups.find(g => g.group.name === 'Verse 1');
  const manualVerse1FirstCueId = manualVerse1Group?.cueIdentifiers[0]?.string;
  const manualVerse1SlideIndex = objManual.cues.findIndex(c => c.uuid.string === manualVerse1FirstCueId);

  console.log('Manual Verse 1 first slide index:', manualVerse1SlideIndex);

  const downloadedSlide = objDownloaded.cues[downloadedVerse1SlideIndex];
  const manualSlide = objManual.cues[manualVerse1SlideIndex];

  const downloadedElement = downloadedSlide.actions[0].slide.presentation.baseSlide.elements[0].element;
  const manualElement = manualSlide.actions[0].slide.presentation.baseSlide.elements[0].element;

  console.log('\n=== DOWNLOADED RTF ===');
  const downloadedRTF = Buffer.from(downloadedElement.text.rtfData, 'base64').toString('utf-8');
  console.log(downloadedRTF);

  console.log('\n=== MANUAL RTF (WITH SHADOW) ===');
  const manualRTF = Buffer.from(manualElement.text.rtfData, 'base64').toString('utf-8');
  console.log(manualRTF);

  console.log('\n=== RTF COMPARISON ===');
  if (downloadedRTF === manualRTF) {
    console.log('✅ RTF IS IDENTICAL!');
  } else {
    console.log('❌ RTF IS DIFFERENT');
    // Find first difference
    for (let i = 0; i < Math.max(downloadedRTF.length, manualRTF.length); i++) {
      if (downloadedRTF[i] !== manualRTF[i]) {
        console.log(`First difference at position ${i}:`);
        console.log('Downloaded:', downloadedRTF.substring(Math.max(0, i - 30), i + 50));
        console.log('Manual:    ', manualRTF.substring(Math.max(0, i - 30), i + 50));
        break;
      }
    }
  }

  console.log('\n=== DOWNLOADED TEXT ATTRIBUTES ===');
  console.log(JSON.stringify(downloadedElement.text.attributes, null, 2));

  console.log('\n=== MANUAL TEXT ATTRIBUTES (WITH SHADOW) ===');
  console.log(JSON.stringify(manualElement.text.attributes, null, 2));

  console.log('\n=== TEXT ATTRIBUTES COMPARISON ===');
  const downloadedAttrs = JSON.stringify(downloadedElement.text.attributes, null, 2);
  const manualAttrs = JSON.stringify(manualElement.text.attributes, null, 2);
  if (downloadedAttrs === manualAttrs) {
    console.log('✅ TEXT ATTRIBUTES ARE IDENTICAL!');
  } else {
    console.log('❌ TEXT ATTRIBUTES ARE DIFFERENT');
  }

  console.log('\n=== DOWNLOADED SHADOW ===');
  console.log(JSON.stringify(downloadedElement.shadow, null, 2));

  console.log('\n=== MANUAL SHADOW ===');
  console.log(JSON.stringify(manualElement.shadow, null, 2));

  console.log('\n=== SHADOW COMPARISON ===');
  const downloadedShadow = JSON.stringify(downloadedElement.shadow, null, 2);
  const manualShadow = JSON.stringify(manualElement.shadow, null, 2);
  if (downloadedShadow === manualShadow) {
    console.log('✅ SHADOW IS IDENTICAL!');
  } else {
    console.log('❌ SHADOW IS DIFFERENT');
  }
}

compareNewFiles();
