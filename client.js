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
  { name: 'Alice', id: '1234' },
  { name: 'Sally', id: '5678' }
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
  const version = await ipfsNode.version()
  console.log('Version:', version.version, '\n')

  /* create id based encryption (IBE) instance */
  console.log('Initializing ID Based Encryption system...\n')
  const ibe = await cryptid.getInstance()

  /* uncomment to create new ibe paramters */
  //const ibeSetupResult = ibe.setup(cryptid.SecurityLevel.LOWEST)
  //console.log(util.format('Saving ibe paramters to %s...', IBE_SETUP_FILE_NAME))
  //saveIbeParamters(IBE_SETUP_FILE_NAME, JSON.stringify(ibeSetupResult))

  let input = ''
  let fileName = ''
  let fileContent = ''
  let peerSelection = ''
  let peerId = ''
  let ibeSetup = {}
  let encryptResult = {} 
  let pkgMessage = {}

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

      pkgMessage = createMessage('public', peerId, fileName, fileContent)

      /* send to PKG for upload */
      await ipfsNode.pubsub.publish(PKG_TOPIC, new TextEncoder().encode(pkgMessage))
      break

    /* decrypt a file */
    case '3':
      showPeers(peers)
      peerSelection = readlineSync.question('Who are you? ')
      peerId = getPeerId(peerSelection, peers)


      console.log('Performing authenication...\n')
      console.log('Requesting private key from PKG...\n')

      /* load ibe paramters. TODO: move to PKG */
      ibeSetup = JSON.parse(readFile(IBE_SETUP_FILE_NAME))
      const extractResult = ibe.extract(
        ibeSetup.publicParameters, ibeSetup.masterSecret, peerId)
      console.log('Private key retrieved.\n')

      /* get encrypted IPFS file */
      const cid = readlineSync.question('Enter the ipfs file CID: ')
      encryptResult = await ipfsCat(ipfsNode, cid)

      /* decrypt the file */
      console.log('Decrypting file...\n')
      const decryptResult = ibe.decrypt(
        ibeSetup.publicParameters, extractResult.privateKey,
        JSON.parse(encryptResult).ciphertext);
      console.log(decryptResult.plaintext)
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
function createMessage(type, peerId, fileName, fileContent) {
  const encodedContent = new TextEncoder().encode(fileContent)
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
