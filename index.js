const https = require('https');
const fs = require('fs');
const ProgressBar = require('progress');

const oshindexer = {
    blockstreamAPIEndpoint: 'https://blockstream.info/api',
    apiKey: null,
    esploraEndpoint: null,

    setApiKey: function(key) {
        this.apiKey = key;
    },

    setEsploraEndpoint: function(endpoint) {
        this.esploraEndpoint = endpoint;
    },

    getEndpoint: function() {
        return this.esploraEndpoint || this.blockstreamAPIEndpoint;
    },

    isValidJSON: function(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    },

    decodeAndExtractData: function(hexData) {
        const decodedData = Buffer.from(hexData, 'hex').toString('utf8');
        const startIndex = decodedData.indexOf('{"p":"brc-20"');
        const endIndex = decodedData.lastIndexOf('}') + 1;
        if (startIndex !== -1 && endIndex !== -1) {
            const extractedJSON = decodedData.substring(startIndex, endIndex);
            if (this.isValidJSON(extractedJSON)) {
                return JSON.parse(extractedJSON);
            }
        }
        return null;
    },

    sleep: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    fetchBlockHash: async function(blockHeight) {
        return new Promise((resolve, reject) => {
            https.get(`${this.getEndpoint()}/block-height/${blockHeight}`, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve(data.trim());
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    },

    fetchTxData: async function(txid) {
        return new Promise((resolve, reject) => {
            https.get(`${this.getEndpoint()}/tx/${txid}`, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (this.isValidJSON(data)) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(`Unexpected response for transaction ${txid}: ${data}`);
                    }
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    },

    extractBRC20FromTx: async function(txData) {
        const brc20Data = [];
        if (txData && txData.vin) {
            for (let vin of txData.vin) {
                if (vin.witness && vin.witness.length > 0) {
                    for (const witnessData of vin.witness) {
                        const parsedData = this.decodeAndExtractData(witnessData);
                        if (parsedData) {
                            brc20Data.push(parsedData);
                        }
                    }
                }
            }
        }
        return brc20Data;
    },

    fetchBlockTxs: async function(blockHash) {
        return new Promise((resolve, reject) => {
            https.get(`${this.getEndpoint()}/block/${blockHash}/txids`, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (this.isValidJSON(data)) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(`Unexpected response for block ${blockHash} transactions: ${data}`);
                    }
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    },

    main: async function(startingBlockHeight = 785993) {
        let currentBlockHeight = startingBlockHeight;
        let allBRC20Data = [];

        while (true) {
            try {
                const blockHash = await this.fetchBlockHash(currentBlockHeight);
                if (!blockHash || blockHash.includes("Block not found")) {
                    console.log("Waiting for a new block...");
                    await this.sleep(5 * 60 * 1000); // Wait for 5 minutes before checking again
                    continue;
                }

                const txids = await this.fetchBlockTxs(blockHash);
                const progressBar = new ProgressBar(`Processing Block ${currentBlockHeight} [:bar] :current/:total :percent :etas`, {
                    complete: '=',
                    incomplete: ' ',
                    width: 50,
                    total: txids.length,
                });

                for (const txid of txids) {
                    const txData = await this.fetchTxData(txid);
                    const brc20Data = await this.extractBRC20FromTx(txData);
                    allBRC20Data = allBRC20Data.concat(brc20Data);
                    progressBar.tick();
                    await this.sleep(12);
                }

                // Save all BRC20 data to a JSON file after processing each block
                fs.writeFileSync('indexer.json', JSON.stringify(allBRC20Data, null, 2));
                console.log(`All BRC20 data up to block ${currentBlockHeight} saved to indexer.json`);

                // Increment block height to process the next block
                currentBlockHeight++;

            } catch (error) {
                console.error("Error:", error);
                await this.sleep(5 * 60 * 1000); // Wait for 5 minutes before trying again
            }
        }
    }
};

// Exécution du SDK
const startingBlockHeight = process.argv[2] ? parseInt(process.argv[2]) : 785993;
oshindexer.main(startingBlockHeight);