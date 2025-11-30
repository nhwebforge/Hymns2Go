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

  const downloadedEl = messageDownloaded.cues[1].actions[0].slide.presentation.baseSlide.elements[0];
  const manualEl = messageManual.cues[1].actions[0].slide.presentation.baseSlide.elements[0];

  console.log('=== ELEMENT WRAPPER KEYS ===');
  console.log('Downloaded:', Object.keys(downloadedEl));
  console.log('Manual:', Object.keys(manualEl));
  
  console.log('\n=== LOOKING FOR textScroller ===');
  console.log('Downloaded has textScroller?', 'textScroller' in downloadedEl);
  console.log('Manual has textScroller?', 'textScroller' in manualEl);
  
  if ('textScroller' in manualEl) {
    console.log('\nManual textScroller:', JSON.stringify(manualEl.textScroller, null, 2));
  }
}

check();
