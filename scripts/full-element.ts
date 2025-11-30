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

  // Check if shadow field exists and has enable
  console.log('=== CHECKING SHADOW ENABLE FIELD ===');
  console.log('Downloaded shadow hasOwnProperty("enable"):', downloadedElement.shadow.hasOwnProperty('enable'));
  console.log('Downloaded shadow.enable value:', downloadedElement.shadow.enable);
  console.log('Manual shadow hasOwnProperty("enable"):', manualElement.shadow.hasOwnProperty('enable'));
  console.log('Manual shadow.enable value:', manualElement.shadow.enable);
  
  console.log('\n=== ALL SHADOW KEYS ===');
  console.log('Downloaded:', Object.keys(downloadedElement.shadow));
  console.log('Manual:', Object.keys(manualElement.shadow));
}

check();
