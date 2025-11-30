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

  const downloadedAttrs = messageDownloaded.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element.text.attributes;
  const manualAttrs = messageManual.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element.text.attributes;

  console.log('=== DOWNLOADED SLIDE 2 text.attributes ===');
  for (const key in downloadedAttrs) {
    console.log(key + ':', JSON.stringify(downloadedAttrs[key]));
  }
  
  console.log('\n=== MANUAL SLIDE 2 text.attributes ===');
  for (const key in manualAttrs) {
    console.log(key + ':', JSON.stringify(manualAttrs[key]));
  }
  
  console.log('\n=== DIFFERENCES ===');
  const allKeys = new Set([...Object.keys(downloadedAttrs), ...Object.keys(manualAttrs)]);
  for (const key of allKeys) {
    if (!(key in downloadedAttrs)) {
      console.log('ONLY IN MANUAL:', key, '=', JSON.stringify(manualAttrs[key]));
    } else if (!(key in manualAttrs)) {
      console.log('ONLY IN DOWNLOADED:', key, '=', JSON.stringify(downloadedAttrs[key]));
    }
  }
}

check();
