const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

async function check() {
  const protoPath = path.join(process.cwd(), 'lib', 'proto');
  const root = await protobuf.load([
    path.join(protoPath, 'presentation.proto'),
  ]);

  const PresentationType = root.lookupType('rv.data.Presentation');

  const bufferDownloaded = fs.readFileSync('/Users/nicholasharvey/Downloads/Come__let_us_sing.pro');
  const messageDownloaded = PresentationType.decode(bufferDownloaded);

  const bufferManual = fs.readFileSync('/Users/nicholasharvey/Documents/ProPresenter/Libraries/Hymns/Come__let_us_sing.pro');
  const messageManual = PresentationType.decode(bufferManual);

  const downloadedElement = messageDownloaded.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element;
  const manualElement = messageManual.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element;

  console.log('=== FIELDS ONLY IN MANUAL ===');
  for (const key in manualElement) {
    if (!(key in downloadedElement) || downloadedElement[key] === null || downloadedElement[key] === undefined) {
      console.log(key, '=', JSON.stringify(manualElement[key]));
    }
  }
  
  console.log('\n=== FIELDS ONLY IN DOWNLOADED ===');
  for (const key in downloadedElement) {
    if (!(key in manualElement) || manualElement[key] === null || manualElement[key] === undefined) {
      console.log(key, '=', JSON.stringify(downloadedElement[key]));
    }
  }
}

check();
