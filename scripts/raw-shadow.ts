const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

async function check() {
  const protoPath = path.join(process.cwd(), 'lib', 'proto');
  const root = await protobuf.load([
    path.join(protoPath, 'presentation.proto'),
  ]);

  const PresentationType = root.lookupType('rv.data.Presentation');
  const ShadowType = root.lookupType('rv.data.Graphics.Shadow');

  const bufferDownloaded = fs.readFileSync('/Users/nicholasharvey/Downloads/Come__let_us_sing.pro');
  const messageDownloaded = PresentationType.decode(bufferDownloaded);

  const bufferManual = fs.readFileSync('/Users/nicholasharvey/Documents/ProPresenter/Libraries/Hymns/Come__let_us_sing.pro');
  const messageManual = PresentationType.decode(bufferManual);

  const downloadedShadow = messageDownloaded.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element.shadow;
  const manualShadow = messageManual.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element.shadow;

  console.log('=== ENCODING SHADOW TO BYTES ===');
  const downloadedBytes = ShadowType.encode(downloadedShadow).finish();
  const manualBytes = ShadowType.encode(manualShadow).finish();
  
  console.log('Downloaded shadow bytes (hex):', Buffer.from(downloadedBytes).toString('hex'));
  console.log('Manual shadow bytes (hex):', Buffer.from(manualBytes).toString('hex'));
  console.log('\nAre they identical?', Buffer.from(downloadedBytes).equals(Buffer.from(manualBytes)));
}

check();
