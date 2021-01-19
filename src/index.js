const Client = require('./browser-client');

async function main() {
  await Client.start();
}

main();
console.log('pokemon');

/* ------------ Form Functions -------------- */
const senderForm = document.forms['s-form'];
senderForm.addEventListener('submit', e => {
  e.preventDefault();
  const senderPid = senderForm.elements['s-pid'].value;
  const sendToPid = senderForm.elements['s-to-pid'].value;
  const filePath = senderForm.elements['s-file'].value;
  const fileName = filePath.split('\\').pop();
  console.log(senderPid);
  console.log(sendToPid);
  console.log(fileName);
});
