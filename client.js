'use strict'

const ipfs = require('ipfs')
const fs = require('fs')
const cryptid = require('@cryptid/cryptid-js')
const readlineSync = require('readline-sync')
const util = require('util')

const FILE_NAME = 'hello.txt'
const PEER_ID = { name: 'test_peer_id' }

main()

async function main() {
  /* creates IPFS instance */
  const ipfsNode = await ipfs.create()
  const version = await ipfsNode.version()
  console.log('Version:', version.version, '\n')

  /* create id based encryption (IBE) instance */
  const ibe = await cryptid.getInstance()
  const ibeSetupResult = ibe.setup(cryptid.SecurityLevel.LOWEST)
  console.log('ID based encryption system initialized...\n')

  let input = ''
  while (input != 'q') {
    showMenu()
    input = readlineSync.question('Please select a menu item (q to quit): ')

    switch(input) {
      case '1':
        const fileName = readlineSync.question('Enter file name: ')
        const fileContents = readFile(fileName)
        if (fileContents !== '') {
          await addFileToIPFS(ipfsNode, fileName, fileContents)
        }
        break

      case 'q':
        break

      default:
        console.log('\nInvalid input, select again.\n')
    }
  }

  //const fileContents = readFile(FILE_NAME)

  //const encryptResult = ibe.encrypt(
  //  ibeSetupResult.publicParameters, PEER_ID, fileContents)

  //const ipfsFile = await addFileToIPFS(
  //  ipfsNode, FILE_NAME, JSON.stringify(encryptResult))

  //const ipfsFileContents = await ipfsCat(ipfsNode, ipfsFile.cid)

  //const extractResult = ibe.extract(
  //  ibeSetupResult.publicParameters, ibeSetupResult.masterSecret, PEER_ID)

  //const decryptResult = ibe.decrypt(
  //  ibeSetupResult.publicParameters, extractResult.privateKey, encryptResult.ciphertext);
  //console.log(decryptResult.plaintext)

  console.log('program exiting...')
  process.exit(0)
}

/* --------------- Helper Functions ----------------------- */
function showMenu() {
  console.log('1) Add a file to IPFS unecrypted.')
  console.log('2) Add a file to IPFS encrypted.')
  console.log('3) Decrypt a IPFS file.')
  console.log('4) List peers on IPFS.')
  console.log('\n')
}

async function addFileToIPFS(node, fileName, content) {
  const fileAdded = await node.add({
    path: fileName,
    content: content
  })

  console.log(util.format('Added file to IPFS: %s %s \n', fileAdded.path, fileAdded.cid))
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

  return chunks
}
