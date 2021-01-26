'use strict'

const ipfs = require('ipfs')


main()

async function main() {
  /* creates IPFS instance */
  const ipfsNode = await ipfs.create({
    Pubsub: {
      enabled: true
    },
    HTTPHeaders: {
      "Access-Control-Allow-Origin": [ "*" ]
    },
    HTTPHeaders: {
      "Access-Control-Allow-Credentials": true
    }
  });

  const nodePeerId = await ipfsNode.id()
  console.log(`\nPeer Id: ${nodePeerId.id}`)

  const topic = 'my-topic';
  ipfsNode.pubsub.subscribe(topic, msg => {
    console.log(msg);
    console.log(msg.data.toString());
  });
}

