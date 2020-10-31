'use strict'

const ipfs = require('ipfs')
const fs = require('fs')
const cryptid = require('@cryptid/cryptid-js')
const readlineSync = require('readline-sync')
const util = require('util')

const IBE_SETUP_FILE_NAME = 'ibe-setup-parameters.txt'
const PKG_TOPIC = 'PKG-requests'

main()

async function main() {
  /* creates IPFS instance */
  const ipfsNode = await ipfs.create({
    EXPERIMENTAL: {
      pubsub: true
    }
  })
  const version = await ipfsNode.version()
  console.log('Version:', version.version, '\n')

  /* initialize ibe environment */
  const ibe = await cryptid.getInstance()
  const ibeSetup = JSON.parse(readFile(IBE_SETUP_FILE_NAME))
  console.log('Initialized IBE paramters.\n')

  /* handle requests */
  const handleRequests = async (msg) => {
    const message = msg.data.toString()
    const request = JSON.parse(message)
    const { type, peerId } = request
    const identity = { name: peerId }
    console.log(`Received message from client ${peerId}\n\n`)

    /* encrypt message using public key */
    if (type === 'public') {
      /* encrypts message */
      console.log('generating public key and encrypting file...\n')
      const { fileName, fileContent } = request
      const encryptResult = ibe.encrypt(
        ibeSetup.publicParameters, identity, fileContent)

      /* upload to IPFS */
      await addFileToIPFS(ipfsNode, fileName, 
        JSON.stringify(encryptResult))

    /* extract the private key from the peer ID */
    } else if (type === 'private') {
      /* extrate private key */
      console.log(`Extracting private key for ${peerId}...\n`)
      const extractResult = ibe.extract(
        ibeSetup.publicParameters, ibeSetup.masterSecret, identity)

      /* send private key back to client*/
      console.log(`Sending private key to ${peerId}...\n`)
      const testPrivKeyTopic = 'test-priv-key'
      const privateKey = new TextEncoder().encode(JSON.stringify(extractResult))

      /* give client time to subscribe to topic */
      setTimeout(async () => {
        await ipfsNode.pubsub.publish(testPrivKeyTopic, privateKey)
      }, 5000)

    } else {
      console.log('invalid message')
    }
  }

  /* subscribe to topic for receiveing requests from clients */
  await ipfsNode.pubsub.subscribe(PKG_TOPIC, handleRequests)
  console.log(`Awaiting requests at topic: ${PKG_TOPIC}\n\n`)

}

/* --------------- Helper Functions ----------------------- */
function saveIbeParamters(fileName, paramters) {
  fs.writeFileSync(fileName, paramters)
}


function showPeers(peers) {
  console.log()
  peers.forEach((peer, i) => {
    console.log(util.format('%s) Name: %s, Peer ID: %s', i, peer.name, peer.id))
  })
  console.log()
}

function getPeerId(index, peers) {
  return peers[index].id
}

async function addFileToIPFS(node, fileName, fileContent) {
  const fileAdded = await node.add({
    path: fileName,
    content: fileContent
  })

  console.log(util.format('Added file to IPFS: %s %s \n',
    fileAdded.path, fileAdded.cid))
  return fileAdded
}

// file must be in same directory as client.js
function readFile(fileName) {
  let data = ''
  try {
    data = fs.readFileSync(fileName, {encoding: 'utf8', flag: 'r'})
  } catch (e) {
    console.log('file does not exist!')
  }

  return data
}

async function ipfsCat(ipfsNode, cid) {
  const chunks = []
  for await (const chunk of ipfsNode.cat(cid)) {
      chunks.push(chunk)
  }

  return chunks.toString()
}
