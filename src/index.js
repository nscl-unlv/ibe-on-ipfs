const { senderMain } = require('./sender');

let ipfsInstanceExists = false;

document
  .getElementById('sender-btn')
  .addEventListener('click', async () => {
    if (!ipfsInstanceExists) {
      ipfsInstanceExists = true;
      await senderMain();
    } else {
      console.log('IPFS instance already running!');
    }
  });

document
  .getElementById('receiver-btn')
  .addEventListener('click', async () => {
    if (!ipfsInstanceExists) {
      ipfsInstanceExists = true;
      console.log('start receiver node');
    } else {
      console.log('IPFS instance already running!');
    }
  });

