const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

async function completeDiff() {
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

  // Save both slides to JSON for detailed comparison
  fs.writeFileSync('/tmp/downloaded-new.json', JSON.stringify(objDownloaded.cues[1], null, 2));
  fs.writeFileSync('/tmp/manual-new.json', JSON.stringify(objManual.cues[1], null, 2));

  console.log('Files saved. Running diff...\n');
  
  // Get all keys that differ
  const downloadedStr = JSON.stringify(objDownloaded.cues[1], null, 2);
  const manualStr = JSON.stringify(objManual.cues[1], null, 2);
  
  console.log('=== FILE SIZE COMPARISON ===');
  console.log('Downloaded JSON size:', downloadedStr.length);
  console.log('Manual JSON size:', manualStr.length);
  console.log('Difference:', downloadedStr.length - manualStr.length, 'characters');
}

completeDiff();
