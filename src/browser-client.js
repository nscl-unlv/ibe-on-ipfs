'use strict'
const IPFS = require('ipfs');
const util = require('util');

// start IPFS instance in the browser
async function start() {
  document.addEventListener('DOMContentLoaded', async () => {
    const node = await IPFS.create({
      repo: String(Math.random() + Date.now()),
      init: { alogorithm: 'ed25519' },
      EXPERIMENTAL: { pubsub: true }
    });
    console.log('IPFS node is ready');

    const pid = await node.id();
    console.log(`Peer ID: ${pid.id}`);
  });
}

// helper functions
async function addFileToIPFS(node, fileName, fileContent) {
  const fileAdded = await node.add({
    path: fileName,
    content: fileContent
  })

  console.log(util.format('Added file to IPFS: %s %s \n',
    fileAdded.path, fileAdded.cid))
  return fileAdded
}

module.exports = {
  start
}
