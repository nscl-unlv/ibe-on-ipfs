const { senderMain } = require('./sender');
const { receiverMain } = require('./receiver');


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
      await receiverMain();
    } else {
      console.log('IPFS instance already running!');
    }
  });

