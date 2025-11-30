const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

async function checkPresentationOrder() {
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

  console.log('=== PRESENTATION LEVEL FIELDS ===\n');
  console.log('Downloaded fields:', Object.keys(objDownloaded));
  console.log('Manual fields:', Object.keys(objManual));

  console.log('\n=== CUE GROUPS ===\n');
  console.log('Downloaded cueGroups:', JSON.stringify(objDownloaded.cueGroups, null, 2));
  console.log('\nManual cueGroups:', JSON.stringify(objManual.cueGroups, null, 2));

  console.log('\n=== ARRANGEMENTS ===\n');
  console.log('Downloaded arrangements:', JSON.stringify(objDownloaded.arrangements, null, 2));
  console.log('\nManual arrangements:', JSON.stringify(objManual.arrangements, null, 2));
}

checkPresentationOrder();
