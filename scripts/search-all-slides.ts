const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

async function searchAllSlides() {
  const protoPath = path.join(process.cwd(), 'lib', 'proto');
  const root = await protobuf.load([
    path.join(protoPath, 'presentation.proto'),
  ]);

  const PresentationType = root.lookupType('rv.data.Presentation');

  const bufferManual = fs.readFileSync('/Users/nicholasharvey/Documents/ProPresenter/Libraries/Hymns/A_man_there_lived_in_Galilee.pro');
  const messageManual = PresentationType.decode(bufferManual);
  const objManual = PresentationType.toObject(messageManual);

  console.log('=== SEARCHING ALL SLIDES IN MANUAL FILE ===\n');
  console.log('Total cues (slides):', objManual.cues.length);

  for (let i = 0; i < objManual.cues.length; i++) {
    const cue = objManual.cues[i];
    if (cue.actions && cue.actions[0] && cue.actions[0].slide) {
      const element = cue.actions[0].slide.presentation.baseSlide.elements[0];
      if (element && element.element && element.element.text && element.element.text.rtfData) {
        const rtfData = Buffer.from(element.element.text.rtfData, 'base64').toString('utf-8');

        if (rtfData.includes('A man there lived in Galilee')) {
          console.log(`\n*** FOUND IN SLIDE ${i} ***`);
          console.log('Full RTF:\n', rtfData);
          console.log('\n=== ELEMENT STRUCTURE ===');
          console.log('Shadow:', JSON.stringify(element.element.shadow, null, 2));
          console.log('Text attributes:', JSON.stringify(element.element.text.attributes, null, 2));
        }
      }
    }
  }
}

searchAllSlides();
