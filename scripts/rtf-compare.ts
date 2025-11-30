const fs = require('fs');
const protobuf = require('protobufjs');
const path = require('path');

async function compareRTF() {
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

  const downloadedRTF = Buffer.from(objDownloaded.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element.text.rtfData, 'base64').toString('utf-8');
  const manualRTF = Buffer.from(objManual.cues[1].actions[0].slide.presentation.baseSlide.elements[0].element.text.rtfData, 'base64').toString('utf-8');

  console.log('=== DOWNLOADED RTF (NO SHADOW) ===');
  console.log(downloadedRTF);
  console.log('\n=== MANUAL RTF (WITH SHADOW) ===');
  console.log(manualRTF);
  
  console.log('\n=== DIFFERENCES ===');
  if (downloadedRTF === manualRTF) {
    console.log('RTF IS IDENTICAL!');
  } else {
    console.log('RTF IS DIFFERENT!');
  }
}

compareRTF();
