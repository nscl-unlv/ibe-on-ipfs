'use strict'

const ipfs = require('ipfs')
const fs = require('fs')
const cryptid = require('@cryptid/cryptid-js')

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

  const fileContents = readFile(FILE_NAME)

  const encryptResult = ibe.encrypt(
    ibeSetupResult.publicParameters, PEER_ID, fileContents)
  //console.log(JSON.stringify(encryptResult))

  const ipfsFile = await addFileToIPFS(
    ipfsNode, FILE_NAME, JSON.stringify(encryptResult))
  //console.log(ipfsFile.cid)

  const ipfsFileContents = await ipfsCat(ipfsNode, ipfsFile.cid)
  //console.log(ipfsFileContents.toString())

  const extractResult = ibe.extract(
    ibeSetupResult.publicParameters, ibeSetupResult.masterSecret, PEER_ID)
  //console.log(extractResult)

  const decryptResult = ibe.decrypt(
    ibeSetupResult.publicParameters, extractResult.privateKey, encryptResult.ciphertext);
  console.log(decryptResult.plaintext)
}

/* --------------- Helper Functions ----------------------- */

async function addFileToIPFS(node, fileName, content) {
  const fileAdded = await node.add({
    path: fileName,
    content: content
  })

  console.log('Added file to IPFS:', fileAdded.path, fileAdded.cid)
  return fileAdded
}

// file must be in same directory as client.js
function readFile(fileName) {
  const data = fs.readFileSync(fileName, {encoding: 'utf8', flag: 'r'})
  return data
}

async function ipfsCat(ipfsNode, cid) {
  const chunks = []
  for await (const chunk of ipfsNode.cat(cid)) {
      chunks.push(chunk)
  }

  return chunks
}
