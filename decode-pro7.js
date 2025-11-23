const protobuf = require('protobufjs');
const fs = require('fs');
const path = require('path');

async function decodePro7File(filePath) {
  try {
    // Load proto files
    const protoPath = path.join(__dirname, 'lib', 'proto');
    const root = await protobuf.load([
      path.join(protoPath, 'presentation.proto'),
    ]);

    // Get the Presentation message type
    const Presentation = root.lookupType('rv.data.Presentation');

    // Read the binary file
    const buffer = fs.readFileSync(filePath);

    // Decode the message
    const message = Presentation.decode(buffer);

    // Convert to plain object
    const object = Presentation.toObject(message, {
      longs: String,
      enums: String,
      bytes: String,
      defaults: true,
      arrays: true,
      objects: true,
      oneofs: true
    });

    // Output as JSON
    console.log(JSON.stringify(object, null, 2));
  } catch (error) {
    console.error('Error decoding file:', error.message);
    console.error(error.stack);
  }
}

// Get file path from command line
const filePath = process.argv[2] || '/Users/nicholasharvey/Documents/ProPresenter/Libraries/Hymns/Test File.pro';

decodePro7File(filePath);
