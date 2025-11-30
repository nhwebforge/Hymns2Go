const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

async function compare() {
  const protoPath = path.join(process.cwd(), 'lib', 'proto');
  const root = await protobuf.load([
    path.join(protoPath, 'presentation.proto'),
  ]);

  const PresentationType = root.lookupType('rv.data.Presentation');

  const bufferDownloaded = fs.readFileSync('/Users/nicholasharvey/Downloads/_Tis_good__Lord__to_be_here.pro');
  const messageDownloaded = PresentationType.decode(bufferDownloaded);
  const objDownloaded = PresentationType.toObject(messageDownloaded);

  const bufferManual = fs.readFileSync('/Users/nicholasharvey/Documents/ProPresenter/Libraries/Hymns/_Tis_good__Lord__to_be_here.pro');
  const messageManual = PresentationType.decode(bufferManual);
  const objManual = PresentationType.toObject(messageManual);

  const downloadedEl = objDownloaded.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element;
  const manualEl = objManual.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element;

  console.log('=== DOWNLOADED (NO SHADOW) - text.attributes ===');
  console.log(JSON.stringify(downloadedEl.text.attributes, null, 2));
  
  console.log('\n\n=== MANUAL (WITH SHADOW) - text.attributes ===');
  console.log(JSON.stringify(manualEl.text.attributes, null, 2));
}

compare();
