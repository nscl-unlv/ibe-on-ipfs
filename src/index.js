const IPFS = require('ipfs');
const util = require('util');
const path = require('path');

clientMain();
console.log('pokemon');

async function clientMain() {
  // start IPFS
  document.addEventListener('DOMContentLoaded', async () => {
    const node = await IPFS.create({
      repo: String(Math.random() + Date.now()),
      init: { alogorithm: 'ed25519' },
      EXPERIMENTAL: { pubsub: true }
    });
    console.log('IPFS node is ready');
    tempNode = node;

    const pid = await node.id();
    console.log(`Peer ID: ${pid.id}`);

    // get file contents
    let inputFile = document.getElementById('s-file');
    let fileName = ''
    let fileContents = '';
    inputFile.addEventListener('change', () => {
      fileName = inputFile.files[0].name;

      let fr = new FileReader();
      fr.readAsText(inputFile.files[0]);
      fr.onload = () => {
        fileContents = fr.result;
      };
    });

    // share file on ipfs
    const senderForm = document.forms['s-form'];
    senderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const senderPid = senderForm.elements['s-pid'].value;
      const sendToPid = senderForm.elements['s-to-pid'].value;
      const cid = await addFileIpfs(node, fileName, fileContents);
    });

  }); // end addEventListener
}


/* ------------ Helper Functions -------------- */
async function addFileIpfs(node, fileName, fileContent) {
  const fileAdded = await node.add({
    path: fileName,
    content: fileContent
  });
  console.log(util.format('Added file to IPFS: %s %s \n',
    fileAdded.path, fileAdded.cid));

  return fileAdded.cid;
}

