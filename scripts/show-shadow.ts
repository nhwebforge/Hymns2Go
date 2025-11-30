const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

async function showShadow() {
  const protoPath = path.join(process.cwd(), 'lib', 'proto');
  const root = await protobuf.load([
    path.join(protoPath, 'presentation.proto'),
  ]);

  const PresentationType = root.lookupType('rv.data.Presentation');

  const bufferManual = fs.readFileSync('/Users/nicholasharvey/Documents/ProPresenter/Libraries/Hymns/_Tis_good__Lord__to_be_here.pro');
  const messageManual = PresentationType.decode(bufferManual);
  const objManual = PresentationType.toObject(messageManual);

  const manualEl = objManual.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element;

  console.log('=== MANUAL FILE (WITH SHADOW) - ALL SHADOW-RELATED FIELDS ===\n');
  
  console.log('1. Element-level shadow:');
  console.log(JSON.stringify(manualEl.shadow, null, 2));
  
  console.log('\n2. Text-level shadow:');
  console.log(JSON.stringify(manualEl.text.shadow, null, 2));
  
  console.log('\n3. Text attributes strokeWidth and strokeColor:');
  console.log('strokeWidth:', manualEl.text.attributes.strokeWidth);
  console.log('strokeColor:', JSON.stringify(manualEl.text.attributes.strokeColor, null, 2));
  
  console.log('\n4. Full text.attributes object:');
  console.log(JSON.stringify(manualEl.text.attributes, null, 2));
}

showShadow();
