const cryptid = require('@cryptid/cryptid-js');
const IPFS = require('ipfs');
const util = require('util');
const path = require('path');

// TODO: move to PKG server
const ibeSetup = {"publicParameters":{"fieldOrder":"4957260162275438316252191296467403952204205591011298306767298132697199126199675187147343485710518404842036587478511694306658374970862997747937916377323387","subgroupOrder":"1461501637330902918203684832716283019653785059327","pointP":{"x":"1759981139153088184482497969356322559520201589622397133943812668541782200393241524277496056503385648158201477523338181066832749505288665379090507993220725","y":"3890282569570440021375533923621499185864016855804248366316252045554593081403785797928298448639775331710847123166368275020748910562928809965629229968706282"},"pointPpublic":{"x":"3404993143214759727799885561920137966975236015864653478185883898000028882173725660611077186204251149714937904371972374670096155605010504372941794292921490","y":"1150367080250481205505172207325116590334860881325851751687044822363354830943107026772328575858467200059807223776815883664234100946086387601921356739419039"},"securityLevel":0},"success":true}


clientMain();

async function clientMain() {
  document.addEventListener('DOMContentLoaded', async () => {
    // start IPFS
    const node = await IPFS.create({
      repo: String(Math.random() + Date.now()),
      init: { alogorithm: 'ed25519' },
      EXPERIMENTAL: { pubsub: true }
    });
    console.log('IPFS node is ready');
    tempNode = node;

    const pid = await node.id();
    console.log(`Peer ID: ${pid.id}`);

    // start IBE
    console.log('Initializing ID Based Encryption system...\n');
    const ibe = await cryptid.getInstance();

    // get file contents
    let inputFile = document.getElementById('s-file');
    let fileName = ''
    let fileContents = '';
    inputFile.addEventListener('change', () => {
      fileName = inputFile.files[0].name;

      let fr = new FileReader();
      fr.readAsText(inputFile.files[0]);
      fr.onload = () => {
        fileContents = fr.result;
      };
    });

    // share file on ipfs
    const senderForm = document.forms['s-form'];
    senderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const senderPid = senderForm.elements['s-pid'].value;
      const sendToPid = senderForm.elements['s-to-pid'].value;
      const encryptChecked = senderForm.elements['encrypt'].checked;

      // TODO: encryption checkbox

      // TODO: add encryption function

      //const cid = await addFileIpfs(node, fileName, fileContents);
    });

  }); // end addEventListener
}


/* ------------ Helper Functions -------------- */
async function addFileIpfs(node, fileName, fileContent) {
  const fileAdded = await node.add({
    path: fileName,
    content: fileContent
  });
  console.log(util.format('Added file to IPFS: %s %s \n',
    fileAdded.path, fileAdded.cid));

  return fileAdded.cid;
}

