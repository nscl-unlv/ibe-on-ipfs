const Client = require('./browser-client');

async function main() {
  await Client.start();
}

main();
console.log('refresh-check');
