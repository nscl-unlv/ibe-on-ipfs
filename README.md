<p align="center">
  <img src="./assets/imgs/unlv-emblem.png" width="250" />
</p>
                                                  
# An ID Based Encryption Scheme on IPFS

Author: Phillipe Austria - Research Assistant

Adviser: Dr. Yoohwan Kim - Associate Professor

Class: CS789 Advance Security Network

University: The University of Nevada, Las Vegas

Publication: *in-progress*

## Overview

This web-application is a demonstration on using ID-Based Encryption (IBE) within IPFS to encrypt files only a specific IPFS node can decrypt. The application is only a partial implmentation of our scheme which is described in our paper "An ID Based Encryption Scheme on IPFS". It demonstrations the main step on how node's peer-id can be used as a public encryption key. We use [Crypt-ID's](https://github.com/cryptid-org/getting-started#CryptID.native-+-CryptID.js) Javascript implmentation, which is based on the [Boneh-Franklin](https://crypto.stanford.edu/~dabo/papers/bfibe.pdf) IBE Scheme. Please refer to the paper for details on the entire scheme.

Because this is a demo application, the form will only allow text files to be uploaded. Additionally, though messages are encrypted, do not upload any text file with valuable information.

### Identity Based Encryption

### The InterPlanetary File System (IPFS)

### Build

You will need Node.js installed. After installing Node.js, run the collowing commands in terminal:

`git clone https://github.com/phillipe-austria/unlv-ibe-on-ipfs.git && cd unlv-ibe-on-ipfs` - clone repository.

`npm install` - install dependencies.

`npm run build` - build a bundle.js file using browserify.

In a seperate terminal, run `npm run ipfs` - starts the IPFSJS daemon(*).

`npm run allowCors` - allows the browser to use the IPFSJS daemon API.

`npm run serve` - starts the application on localhost:8090.

*GossipSub (pubsub) cannot be used with browerified IPFS and needs a live daemon.


## How to use the Application

<div>
  <img src="/assets/imgs/sender-form-1.png" width="500px" />
  <img src="/assets/imgs/reciever-form-1.png" width="550px" />
<div>

There are two forms, the Sender and Receiver. The Sender uploads file and uses the Receiver's peer-id to encrypt the message. The Sender also sends a GossipSub message containing the CID and file hash of the plaintext file to the Receiver. The Recevier's recevies the message and uses the information to decrypt and download the message. 

Start By opening two tabs in the browser, select one to be the Sender and the other to be the Reciever. As the Sender, copy and paste the Receiver's peer-id, and select a text file to upload. Click Encrypt and Add File to IPFS. The file will then be encrypted with IBE, using the Receiver's peer-id concatenated with plaintext file's hash, as the public key. Once encrypted, the file is added (shared) to the IPFS network. Lastly a Pubsub message is sent to the Receiver which includes the CID and plaintext file hash. To see the encrypted file, you can open the browser console and inspect the cipherText object.

<img src="/assets/imgs/sender-form-2.png" width="600px" />

Go to the Receiver form. The GossipSub message should have appeared at the bottom. Open the browser console, and you will notice the node has subscribed to the topic of its own peer-id, which it how it was able to receive the GossipSub messages. Copy the file hash in into box 1.) and click Request Private Key. Next, copy the CID into box 2.) and click Get File. This will download the file from IPFS. Click Decrypt File to decrypt the file. In the background, the Receiver retrieves the private key by presenting peer-id and plaintext file hash to the Private Key Generator (PKG)*. Once the key is retrieved, the Receiver can decrypt the file. Lasly, click  Donwload File to download the orginal plaintext file. 

<img src="/assets/imgs/reciever-form-2.png" width="600px" />

*For this demo, the Reciever has the master key to generate private keys, essentially acting as the PKG itself. In a real world senario, the PKG would be on a seperate server and only it would have the master key. Upon a key request, the PKG generates a node's private key and sends it back to the requesting node. Addtionally, the private should be sent through a secure channel.
