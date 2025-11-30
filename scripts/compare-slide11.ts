const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

async function compareSlide11() {
  const protoPath = path.join(process.cwd(), 'lib', 'proto');
  const root = await protobuf.load([
    path.join(protoPath, 'presentation.proto'),
  ]);

  const PresentationType = root.lookupType('rv.data.Presentation');

  const bufferDownloaded = fs.readFileSync('/Users/nicholasharvey/Downloads/A_man_there_lived_in_Galilee.pro');
  const messageDownloaded = PresentationType.decode(bufferDownloaded);
  const objDownloaded = PresentationType.toObject(messageDownloaded);

  const bufferManual = fs.readFileSync('/Users/nicholasharvey/Documents/ProPresenter/Libraries/Hymns/A_man_there_lived_in_Galilee.pro');
  const messageManual = PresentationType.decode(bufferManual);
  const objManual = PresentationType.toObject(messageManual);

  console.log('=== COMPARING SLIDE 11 ===\n');

  const downloadedSlide = objDownloaded.cues[11];
  const manualSlide = objManual.cues[11];

  const downloadedElement = downloadedSlide.actions[0].slide.presentation.baseSlide.elements[0].element;
  const manualElement = manualSlide.actions[0].slide.presentation.baseSlide.elements[0].element;

  console.log('=== DOWNLOADED RTF (SLIDE 11) ===');
  const downloadedRTF = Buffer.from(downloadedElement.text.rtfData, 'base64').toString('utf-8');
  console.log(downloadedRTF);

  console.log('\n=== MANUAL RTF (SLIDE 11 - WITH SHADOW) ===');
  const manualRTF = Buffer.from(manualElement.text.rtfData, 'base64').toString('utf-8');
  console.log(manualRTF);

  console.log('\n=== DOWNLOADED TEXT ATTRIBUTES ===');
  console.log(JSON.stringify(downloadedElement.text.attributes, null, 2));

  console.log('\n=== MANUAL TEXT ATTRIBUTES (WITH SHADOW) ===');
  console.log(JSON.stringify(manualElement.text.attributes, null, 2));

  console.log('\n=== DOWNLOADED SHADOW ===');
  console.log(JSON.stringify(downloadedElement.shadow, null, 2));

  console.log('\n=== MANUAL SHADOW ===');
  console.log(JSON.stringify(manualElement.shadow, null, 2));
}

compareSlide11();
