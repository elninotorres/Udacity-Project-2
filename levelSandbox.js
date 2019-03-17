// /* ===== Persist data with LevelDB ===================================
// |  Learn more: level: https://github.com/Level/level     |
// |  =============================================================*/

// const level = require('level');
// const chainDB = './chaindata';
// const db = level(chainDB);

// // Add data to levelDB with key/value pair
// function addLevelDBData(key, value) {
//   db.put(key, value, function (err) {
//     if (err) return console.log('Block ' + key + ' submission failed', err);
//   })
// }

// // Get data from levelDB with key
// function getLevelDBData(key) {
//   return new Promise(function (resolve, reject) {
//     // Add your code here, remember in Promises you need to resolve() or reject()
//     db.get(key, (err, value) => {
//       if (err) {
//         if (err.type == 'NotFoundError') {
//           resolve(undefined);
//         } else {
//           console.log('Block ' + key + ' get failed', err);
//           reject(err);
//         }
//       } else {
//         resolve(value);
//       }
//     });
//   });
// }

// // Add data to levelDB with value
// function addDataToLevelDB(value) {
//   let i = 0;
//   db.createReadStream().on('data', function (data) {
//     i++;
//   }).on('error', function (err) {
//     return console.log('Unable to read data stream!', err)
//   }).on('close', function () {
//     console.log('Block #' + i);
//     addLevelDBData(i, value);
//   });
// }

// /* ===== Testing ==============================================================|
// |  - Self-invoking function to add blocks to chain                             |
// |  - Learn more:                                                               |
// |   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
// |                                                                              |
// |  * 100 Milliseconds loop = 36,000 blocks per hour                            |
// |     (13.89 hours for 500,000 blocks)                                         |
// |    Bitcoin blockchain adds 8640 blocks per day                               |
// |     ( new block every 10 minutes )                                           |
// |  ===========================================================================*/


// (function theLoop(i) {
//   setTimeout(function () {
//     addDataToLevelDB('Testing data');
//     if (--i) theLoop(i);
//   }, 100);
// })(10);

/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata2';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key) {
        let self = this;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.get(key, (err, value) => {
                if (err) {
                    if (err.type == 'NotFoundError') {
                        resolve(undefined);
                    } else {
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                } else {
                    resolve(value);
                }
            });
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject() 
            self.db.put(key, value, function (err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                resolve(value);
            });
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        let count = 0;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.createReadStream()
                .on('data', function (data) {
                    count += 1;
                    console.log(data.key, '=', data.value)
                })
                .on('error', function (err) {
                    console.log('Oh my!', err)
                    reject(err);
                })
                .on('close', function () {
                    console.log('Stream closed')
                    resolve(count);

                })
                .on('end', function () {
                    console.log('Stream ended')
                })
        });
    }


}

module.exports.LevelSandbox = LevelSandbox;

