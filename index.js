'use strict'

const IPFS = require('ipfs')

async function main () {
  const node = await IPFS.create()
  const version = await node.version()

  console.log('Version:', version.version)

  //const fileAdded = await node.add({
  //  path: 'hello.txt',
  //  content: 'Hello World Javascript'
  //})
  //console.log('Added file:', fileAdded.path, fileAdded.cid)

  let cid = 'QmPaNQEftUdjvDsCqVoiFkRJG2WGeADpWXp7gjDArj5TQ6'

  //const chunks = []
  //for await (const chunk of node.cat(fileAdded.cid)) {
  //    chunks.push(chunk)
  //}

  //console.log('Added file contents:', chunks.toString())

  for await (const file of node.get(cid)) {
    console.log(file.path)

    if (!file.content) continue;

    const content = []

    for await (const chunk of file.content) {
        content.push(chunk)
      }

      console.log(content.toString())
    }
  }

main()
