
const createClient = require('ipfs-http-client');
const cryptid = require('@cryptid/cryptid-js');
//const IPFS = require('ipfs');
//const util = require('util');

// Client Ipfs
const clientApi = '5002' // 5001 for go-ipfs

// TODO: move to PKG server
const ibeSetup = {"publicParameters":{"fieldOrder":"4957260162275438316252191296467403952204205591011298306767298132697199126199675187147343485710518404842036587478511694306658374970862997747937916377323387","subgroupOrder":"1461501637330902918203684832716283019653785059327","pointP":{"x":"1759981139153088184482497969356322559520201589622397133943812668541782200393241524277496056503385648158201477523338181066832749505288665379090507993220725","y":"3890282569570440021375533923621499185864016855804248366316252045554593081403785797928298448639775331710847123166368275020748910562928809965629229968706282"},"pointPpublic":{"x":"3404993143214759727799885561920137966975236015864653478185883898000028882173725660611077186204251149714937904371972374670096155605010504372941794292921490","y":"1150367080250481205505172207325116590334860881325851751687044822363354830943107026772328575858467200059807223776815883664234100946086387601921356739419039"},"securityLevel":0},"success":true}

async function receiverMain() {
  // start IPFS
  //const node = await IPFS.create({
  //  repo: String(Math.random() + Date.now()),
  //  init: { alogorithm: 'ed25519' },
  //  Pubsub: { enabled: true }
  //});
  const ipfsClient = createClient(`/ip4/127.0.0.1/tcp/${clientApi}`); 
  console.log('IPFS node is ready');


  const nodeId = await ipfsClient.id();
  const pid = nodeId.id;
  document.getElementById('r-pid').innerText = pid;

  // start IBE
  console.log('Initializing ID Based Encryption system...\n');
  const ibe = await cryptid.default.getInstance();


  // get file from IPFS
  const receiverForm = document.forms['r-form'];
  const cidInput = receiverForm.elements['enc-cid'];
  const getFileBtn = receiverForm.elements['get-file'];

  getFileBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const cid = cidInput.value;
    await catFile(ipfsClient, cid);
  });

  // TODO: handle GossipSub messages
  const topic = 'my-topic';
  const handleMsg = msg => {
    console.log(msg)
  };
  await ipfsClient.pubsub.subscribe(topic, handleMsg);
  console.log(`Subscribed to topic: ${topic}`);
} // end clientMain


/* ------------ Helper Functions -------------- */
async function getFile(ipfs, cid) {
  for await (const file of ipfs.get(cid)) {
    console.log(file.type, file.path)

    if (!file.content) continue;

    const content = []

    for await (const chunk of file.content) {
      content.push(chunk)
    }

    console.log(content.toString())
  }
}

async function catFile(ipfs, cid) {
  for await (const chunk of ipfs.cat(cid)) {
    const text = new TextDecoder('utf-8').decode(chunk);
    console.log(text);
    createFileUrl(text)
  }
}

function createFileUrl(text) {
  let data = new Blob([text], {type: 'text/plain'});
  const url = window.URL.createObjectURL(data);
  document.getElementById('dl-link').href = url;
}

module.exports = {
  receiverMain
};

