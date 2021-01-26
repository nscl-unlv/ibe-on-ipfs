
const createClient = require('ipfs-http-client');
const cryptid = require('@cryptid/cryptid-js');

// Client Ipfs
const clientApi = '5002' // 5001 for go-ipfs

// TODO: move to PKG server
const ibeSetup = {"masterSecret":"1270688028488889238800830133097891363377421790352","publicParameters":{"fieldOrder":"4957260162275438316252191296467403952204205591011298306767298132697199126199675187147343485710518404842036587478511694306658374970862997747937916377323387","subgroupOrder":"1461501637330902918203684832716283019653785059327","pointP":{"x":"1759981139153088184482497969356322559520201589622397133943812668541782200393241524277496056503385648158201477523338181066832749505288665379090507993220725","y":"3890282569570440021375533923621499185864016855804248366316252045554593081403785797928298448639775331710847123166368275020748910562928809965629229968706282"},"pointPpublic":{"x":"3404993143214759727799885561920137966975236015864653478185883898000028882173725660611077186204251149714937904371972374670096155605010504372941794292921490","y":"1150367080250481205505172207325116590334860881325851751687044822363354830943107026772328575858467200059807223776815883664234100946086387601921356739419039"},"securityLevel":0},"success":true}

async function receiverMain() {
  // start IPFS
  const ipfsClient = createClient(`/ip4/127.0.0.1/tcp/${clientApi}`); 
  console.log('IPFS node is ready');

  // show pid
  const nodeId = await ipfsClient.id();
  const pid = nodeId.id;
  document.getElementById('r-pid').innerText = pid;

  // start IBE
  console.log('Initializing ID Based Encryption system...\n');
  const ibe = await cryptid.default.getInstance();

  const receiverForm = document.forms['r-form'];

  // generate private key
  let privateKey = {}
  const hashInput = receiverForm.elements['hash'];
  const reqPrivKeyBtn = receiverForm.elements['req-priv-key'];
  reqPrivKeyBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const hash = hashInput.value;
    const id = pid.concat(hash);
    const identity = { name : id };
    const extractResult = await ibe.extract(ibeSetup.publicParameters,
                                            ibeSetup.masterSecret,
                                            identity);
    //console.log(extractResult);
    privateKey = extractResult.privateKey;
    if (extractResult.success) {
      console.log('retrieved private key');
    } else {
      console.log('failed to retrieve private key');
    }
  });

  // get file from IPFS
  let ibeFileObj = {}; 
  const cidInput = receiverForm.elements['enc-cid'];
  const getFileBtn = receiverForm.elements['get-file'];
  getFileBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const cid = cidInput.value;
    const fileContents = await catFile(ipfsClient, cid);
    ibeFileObj = JSON.parse(fileContents);
    if (ibeFileObj.success) {
      console.log('got encrypted file');
    } else {
      console.log('failed to get encrypted file');
    }
  });

  // decrypt file
  let decryptedText = ''
  const decryptBtn = receiverForm.elements['decrypt-file'];
  decryptBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    decryptedText = await decryptFile(ibe, privateKey, ibeFileObj.ciphertext);
    createFileUrl(decryptedText);
    console.log('file decrypted');
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
async function decryptFile(ibe, privateKey, cipherText) {
  const decryptResult = await ibe.decrypt(
    ibeSetup.publicParameters,
    privateKey,
    cipherText);
    const promise = new Promise(resolve => {
      resolve(decryptResult.plaintext);
    })
    return promise;
}

async function catFile(ipfs, cid) {
  for await (const chunk of ipfs.cat(cid)) {
    const text = new TextDecoder('utf-8').decode(chunk);
    const promise = new Promise(resolve => {
      resolve(text);
    })
    return promise;
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

