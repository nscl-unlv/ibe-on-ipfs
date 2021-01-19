'use strict'
const IPFS = require('ipfs');

async function start() {
  document.addEventListener('DOMContentLoaded', async () => {
    const node = await IPFS.create({
      repo: String(Math.random() + Date.now()),
      init: { alogorithm: 'ed25519' }
    });
    console.log('IPFS node is ready');
  });
}

module.exports = {
  start
}
