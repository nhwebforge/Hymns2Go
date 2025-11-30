const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

async function analyzeSlideOrder() {
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

  console.log('=== DOWNLOADED FILE SLIDE ORDER ===\n');
  objDownloaded.cues.forEach((cue, index) => {
    if (cue.actions && cue.actions[0] && cue.actions[0].slide) {
      const element = cue.actions[0].slide.presentation.baseSlide.elements[0];
      if (element && element.element && element.element.text && element.element.text.rtfData) {
        const rtfData = Buffer.from(element.element.text.rtfData, 'base64').toString('utf-8');
        // Extract text snippet
        const textMatch = rtfData.match(/\\strokec3 (.{0,50})/);
        const textSnippet = textMatch ? textMatch[1].replace(/\\/g, '').substring(0, 50) : 'NO TEXT';

        console.log(`Slide ${index}: "${textSnippet}"`);
      }
    }
  });

  console.log('\n\n=== MANUAL FILE SLIDE ORDER ===\n');
  objManual.cues.forEach((cue, index) => {
    if (cue.actions && cue.actions[0] && cue.actions[0].slide) {
      const element = cue.actions[0].slide.presentation.baseSlide.elements[0];
      if (element && element.element && element.element.text && element.element.text.rtfData) {
        const rtfData = Buffer.from(element.element.text.rtfData, 'base64').toString('utf-8');
        // Extract text snippet
        const textMatch = rtfData.match(/\\strokec3 (.{0,50})/);
        const textSnippet = textMatch ? textMatch[1].replace(/\\/g, '').substring(0, 50) : 'NO TEXT';

        console.log(`Slide ${index}: "${textSnippet}"`);
      }
    }
  });

  console.log('\n\n=== CHECKING CUE FIELDS FOR ORDERING ===\n');
  console.log('Downloaded slide 1 cue fields:', Object.keys(objDownloaded.cues[1]));
  console.log('Manual slide 1 cue fields:', Object.keys(objManual.cues[1]));

  console.log('\n=== DOWNLOADED SLIDE 1 CUE ===');
  console.log(JSON.stringify(objDownloaded.cues[1], null, 2).substring(0, 500));

  console.log('\n=== MANUAL SLIDE 1 CUE ===');
  console.log(JSON.stringify(objManual.cues[1], null, 2).substring(0, 500));
}

analyzeSlideOrder();
