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

  const downloadedText = messageDownloaded.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element.text;
  const manualText = messageManual.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element.text;

  console.log('=== DOWNLOADED TEXT OBJECT KEYS ===');
  console.log(Object.keys(downloadedText));
  
  console.log('\n=== MANUAL TEXT OBJECT KEYS ===');
  console.log(Object.keys(manualText));
  
  console.log('\n=== SHADOW FIELD ===');
  console.log('Downloaded text.shadow:', JSON.stringify(downloadedText.shadow, null, 2));
  console.log('Manual text.shadow:', JSON.stringify(manualText.shadow, null, 2));
}

check();
