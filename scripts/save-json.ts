const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

async function saveToJson() {
  const protoPath = path.join(process.cwd(), 'lib', 'proto');
  const root = await protobuf.load([
    path.join(protoPath, 'presentation.proto'),
  ]);

  const PresentationType = root.lookupType('rv.data.Presentation');

  const bufferDownloaded = fs.readFileSync('/Users/nicholasharvey/Downloads/Come__let_us_sing.pro');
  const messageDownloaded = PresentationType.decode(bufferDownloaded);
  const objDownloaded = PresentationType.toObject(messageDownloaded);

  const bufferManual = fs.readFileSync('/Users/nicholasharvey/Documents/ProPresenter/Libraries/Hymns/Come__let_us_sing.pro');
  const messageManual = PresentationType.decode(bufferManual);
  const objManual = PresentationType.toObject(messageManual);

  // Save slide 2 from both files
  fs.writeFileSync('/tmp/downloaded-slide2.json', JSON.stringify(objDownloaded.cues[1], null, 2));
  fs.writeFileSync('/tmp/manual-slide2.json', JSON.stringify(objManual.cues[1], null, 2));

  console.log('Saved to /tmp/downloaded-slide2.json and /tmp/manual-slide2.json');
  console.log('Run: diff /tmp/downloaded-slide2.json /tmp/manual-slide2.json | head -200');
}

saveToJson();
