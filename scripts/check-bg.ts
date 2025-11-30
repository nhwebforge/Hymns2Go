const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

async function check() {
  const protoPath = path.join(process.cwd(), 'lib', 'proto');
  const root = await protobuf.load([
    path.join(protoPath, 'presentation.proto'),
  ]);

  const PresentationType = root.lookupType('rv.data.Presentation');

  const bufferManual = fs.readFileSync('/Users/nicholasharvey/Documents/ProPresenter/Libraries/Hymns/_Glory_to_God___all_heav_n_with_joy_is_ringing.pro');
  const messageManual = PresentationType.decode(bufferManual);
  const objManual = PresentationType.toObject(messageManual);

  const manualSlide = objManual.cues[1].actions[0].slide.presentation.baseSlide;

  console.log('=== MANUAL FILE - baseSlide.backgroundColor ===');
  console.log(JSON.stringify(manualSlide.backgroundColor, null, 2));
  console.log('\n=== MANUAL FILE - baseSlide (all fields) ===');
  console.log(Object.keys(manualSlide));
}

check();
