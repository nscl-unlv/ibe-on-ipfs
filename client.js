'use strict'

const ipfs = require('ipfs')
const fs = require('fs')
const cryptid = require('@cryptid/cryptid-js')
const readlineSync = require('readline-sync')
const util = require('util')


/* TEST Variables */
const FILE_NAME = 'hello.txt'
const PEER_ID = { name: 'test_peer_id' }
const IBE_SETUP_FILE_NAME = 'ibe-setup-parameters.txt'
const peers = [
  { name: 'Bob', id: 'QmST4iWcHnU2TeB9Z2gmLQWCEk6A375znqcVFhDqNHMaGb' },
  { name: 'Alice', id: 'QmWrvrFVdPpbFyiQ1qrHtfR6wHJMtmdZDLEKZi8wqUsf9g' }
]
const PKG_TOPIC = 'PKG-requests'
  

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

  /* create id based encryption (IBE) instance */
  console.log('Initializing ID Based Encryption system...\n')
  const ibe = await cryptid.getInstance()
  const ibeSetup = JSON.parse(readFile(IBE_SETUP_FILE_NAME))

  let input = ''
  let fileName = ''
  let fileContent = ''
  let peerSelection = ''
  let peerId = ''
  let pkgMessage = {}
  let response = {}

  showMenu()
  input = readlineSync.question('Please select a menu item (q to quit): ')

  switch(input) {
    /* add unecrypted file */
    case '1':
      fileName = readlineSync.question('Enter file name: ')
      fileContent = readFile(fileName)
      await addFileToIPFS(ipfsNode, fileName, fileContent)
      break

    /* add ecrypted file */
    case '2':
      /* select file */
      fileName = readlineSync.question('Enter file name: ')
      fileContent = readFile(fileName)

      /* select peer */
      showPeers(peers)
      peerSelection = readlineSync.question('Select a peer: ')
      peerId = getPeerId(peerSelection, peers)
      const identity = { name: peerId }


      /* encrypt */
      const encryptResult = ibe.encrypt(
        ibeSetup.publicParameters, identity, fileContent)

      /* upload to IPFS */
      await addFileToIPFS(ipfsNode, fileName,
        JSON.stringify(encryptResult))
      break

    /* decrypt a file */
    case '3':
      showPeers(peers)
      peerSelection = readlineSync.question('Who are you? ')
      peerId = getPeerId(peerSelection, peers)

      /* retrieve encrypted file */
      const cid = readlineSync.question('Enter the ipfs file CID: ')
      const encryptedFileString = await ipfsCat(ipfsNode, cid)
      const encryptedFileJson = JSON.parse(encryptedFileString)

      /* send request to PKG */
      console.log('Requesting private key from PKG...\n')
      pkgMessage = createMessage('private', peerId)
      response = await ipfsNode.pubsub.publish(PKG_TOPIC, new TextEncoder().encode(pkgMessage))

      /* create topic to receive key */
      const topic = peerId 
      const decryptHandler = (msg) => {
        const privateKeyMsg = JSON.parse(msg.data.toString())
        const decryptResult = ibe.decrypt(ibeSetup.publicParameters, 
          privateKeyMsg.privateKey, encryptedFileJson.ciphertext);
        console.log('Decryption successful!\n')
        console.log(decryptResult.plaintext)
      }
      response = await ipfsNode.pubsub.subscribe(topic, decryptHandler)
      break

    /* list Peers */
    case '4':
      showPeers(peers)
      break

    case 'q':
      break

    default:
      console.log('\nInvalid input, select again.\n')
  }
  console.log('IPFS still running, press ctrl-c to quit')
}

/* --------------- Helper Functions ----------------------- */
function createMessage(type, peerId, fileName='', fileContent='') {
  const message = {
    type,
    peerId,
    fileName,
    fileContent
  }
  return JSON.stringify(message)
}

function saveIbeParamters(fileName, paramters) {
  fs.writeFileSync(fileName, paramters)
}

function showMenu() {
  console.log('')
  console.log('1) Add a file to IPFS unecrypted.')
  console.log('2) Add a file to IPFS encrypted.')
  console.log('3) Decrypt a IPFS file.')
  console.log('4) List peers on IPFS.')
  console.log('\n')
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
