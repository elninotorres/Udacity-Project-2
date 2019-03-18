/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');



/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
  constructor(data) {
    this.hash = "",
      this.height = 0,
      this.body = data,
      this.time = 0,
      this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
  constructor() {
    this.chain = [];
    this.bd = new LevelSandbox.LevelSandbox();
    this.addBlock(new Block("First block in the chain - Genesis block"));
  }

  // Add new block
  addBlock(newBlock) {
    // Block height
    this.getBlockHeight().then((height) => {
      if (height === 0) {
        newBlock.height = 0;
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        newBlock.previousBlockHash = 0;
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        this.bd.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString()).then((value) => {
          console.log(value + 'Added');
        }).catch((err) => {
          console.log(err);
        });
      } else {
        newBlock.height = height + 1;

        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        // previous block hash
        if (height > 0) {
          // newBlock.previousBlockHash = this.chain[this.chain.length - 1].hash;
          this.getBlock(height - 1).then((blockJSon) => {
            let block = JSON.parse(blockJSon);
            // console.log(block);
            newBlock.previousBlockHash = block.hash;
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            // Adding block object to chain
            this.bd.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString()).then((value) => {
              console.log(value + 'Added');
            }).catch((err) => {
              console.log(err);
            });
            console.log(newBlock);
          }).catch((err) => {
            console.log('error' + err);
          });
        }

      }
    }).catch((err) => {
      console.log('error' + err);
    });
    // this.chain.push(newBlock);
  }

  // Get block height
  getBlockHeight() {
    // return this.chain.length-1;
    return this.bd.getBlocksCount();
  }

  // get block
  getBlock(blockHeight) {
    // return object as a single string
    // return JSON.parse(JSON.stringify(this.chain[blockHeight]));
    return this.bd.getLevelDBData(blockHeight);
  }

  // validate block
  validateBlock(blockHeight) {
    // get block object
    this.getBlock(blockHeight).then((value) => {
      let block = value;
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash === validBlockHash) {
        return true;
      } else {
        console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
        return false;
      }
    }).catch((err) => {
      console.log('error' + err);
    });
  }

  // Validate blockchain
  validateChain() {
    // let errorLog = [];
    // for (var i = 0; i < this.chain.length - 1; i++) {
    //   // validate block
    //   if (!this.validateBlock(i)) errorLog.push(i);
    //   // compare blocks hash link
    //   let blockHash = this.chain[i].hash;
    //   let previousHash = this.chain[i + 1].previousBlockHash;
    //   if (blockHash !== previousHash) {
    //     errorLog.push(i);
    //   }
    // }
    // if (errorLog.length > 0) {
    //   console.log('Block errors = ' + errorLog.length);
    //   console.log('Blocks: ' + errorLog);
    // } else {
    //   console.log('No errors detected');
    // }


    let errorLog = [];
    this.getBlockHeight().then((height) => {
      let length = height;
      for (var i = 0; i < length - 1; i++) {
        if (!this.validateBlock(i)) errorLog.push(i);
        this.getBlock(height).then((block) => {
          let blockHash = block.hash;
          this.getBlock(height - 1).then((previousBlock) => {
            let previousHash = previousBlock.hash;
            if (blockHash !== previousHash) {
              errorLog.push(i);
            }
          }).catch((err) => {
            console.log('error' + err);
          });
        }).catch((err) => {
          console.log('error' + err);
        });
      }
      if (errorLog.length > 0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: ' + errorLog);
      } else {
        console.log('No errors detected');
      }
    }).catch((err) => {
      console.log('error' + err);
    });

  }
}

// let myBlock = new Blockchain();
// (function theLoop (i) {
//   setTimeout(() => {
//      myBlock.addBlock(new Block("Second"));

//      if (--i) { 
//      theLoop(i)

//      }
//   }, 100);
// })(2);