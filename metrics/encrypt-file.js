'use strict'

const fs = require('fs');
const cryptid = require('@cryptid/cryptid-js');
const path = require('path');

const FILE_NAME = '1000kb.txt';
const FOLDER = path.join('./', 'files');
const IBE_SETUP_FILE_NAME = 'ibe-setup-parameters.txt';

main()

async function main() {
  console.log('reading file...');
  const fileContent = readFile(path.join(FOLDER, FILE_NAME));

  /* create id based encryption (IBE) instance */
  console.log('Initializing ID Based Encryption system...\n');
  const ibe = await cryptid.getInstance();
  const ibeSetup = JSON.parse(readFile(IBE_SETUP_FILE_NAME));


  console.log('encrypting file...');
  const identity = { name: 'dummy' };
  const encryptResult = ibe.encrypt(
    ibeSetup.publicParameters, identity, fileContent)

  const pureName = path.basename(FILE_NAME, '.txt');
  const newFileName = pureName.concat('-encrypted.txt');
  fs.writeFileSync(
    path.join(FOLDER, newFileName), 
    JSON.stringify(encryptResult));

  console.log(`done encrypting file ${FILE_NAME}`);
}

/* --------------- Helper Functions ----------------------- */
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
