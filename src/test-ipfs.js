'use strict'

const ipfs = require('ipfs')


main()

async function main() {
  /* creates IPFS instance */
  const ipfsNode = await ipfs.create({
    EXPERIMENTAL: {
      pubsub: true
    }
  })
  const nodePeerId = await ipfsNode.id()
  console.log(`\nPeer Id: ${nodePeerId.id}`)

  ipfsNode.pubsub.publish('test-topic', 'hello from node');
}

