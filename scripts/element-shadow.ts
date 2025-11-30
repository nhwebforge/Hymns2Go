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

  console.log('=== DOWNLOADED ELEMENT.SHADOW ===');
  console.log(JSON.stringify(downloadedElement.shadow, null, 2));
  
  console.log('\n=== MANUAL ELEMENT.SHADOW ===');
  console.log(JSON.stringify(manualElement.shadow, null, 2));
  
  console.log('\n=== ARE THEY THE SAME? ===');
  console.log(JSON.stringify(downloadedElement.shadow) === JSON.stringify(manualElement.shadow));
}

check();
