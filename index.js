const https = require('https');
const fs = require('fs');
const ProgressBar = require('progress');
const moment = require('moment');

const oshindexer = {
    // List of API endpoints. We start with Blockstream's Esplora, but you can add more for decentralization.
    apiEndpoints: [
        'https://blockstream.info/api',
        // Example: 'https://another-esplora-instance.com/api'
    ],
    currentEndpointIndex: 0, // first

    // Get the current API endpoint.
    getEndpoint: function() {
        return this.apiEndpoints[this.currentEndpointIndex];
    },

    // Switch to the next API endpoint in case the current one fails.
    switchEndpoint: function() {
        this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.apiEndpoints.length;
    },

    // Generic HTTP request function using the native 'https' module.
    httpRequest: function(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(`Request failed with status code ${res.statusCode}`));
                    }
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    },

    // Check if a string is a valid JSON.
    isValidJSON: function(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    },

    // Decode and extract BRC20 data from hex.
    decodeAndExtractData: function(hexData) {
        const decodedData = Buffer.from(hexData, 'hex').toString('utf8');
        
        const ordinalPattern = /OP_PUSH "ord".*?OP_PUSH 1\s*(json).*?OP_PUSH 0\s*(\{.*?\})\s*OP_ENDIF/;
        const match = ordinalPattern.exec(decodedData);

        if (match && match[1] === "json" && this.isValidJSON(match[2])) {
            return JSON.parse(match[2]);
        }
        return null;
    },

    // Sleep function for waiting.
    sleep: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Fetch the block hash for a given block height.
    fetchBlockHash: async function(blockHeight) {
        try {
            return await this.httpRequest(`${this.getEndpoint()}/block-height/${blockHeight}`);
        } catch (error) {
            this.switchEndpoint(); // Switch to another endpoint in case of error.
            throw error;
        }
    },

    // Fetch transaction data for a given transaction ID.
    fetchTxData: async function(txid) {
        try {
            const data = await this.httpRequest(`${this.getEndpoint()}/tx/${txid}`);
            return this.isValidJSON(data) ? JSON.parse(data) : null;
        } catch (error) {
            this.switchEndpoint(); // Switch to another endpoint in case of error.
            throw error;
        }
    },

    // Extract BRC20 data from a transaction.
    extractBRC20FromTx: async function(txData) {
        if (!txData || !txData.vin) return [];

        const brc20Data = txData.vin.flatMap(vin => {
            if (!vin.witness) return [];

            return vin.witness.map(witnessData => {
                const parsedData = this.decodeAndExtractData(witnessData);
                if (parsedData) {
                    // Add "from", "to", and timestamp to each BRC20 entry
                    parsedData.from = vin.prevout.scriptpubkey_address;
                    parsedData.to = txData.vout[0].scriptpubkey_address;
                    parsedData.timestamp = moment.unix(txData.status.block_time).format('YYYY-MM-DD HH:mm:ss');
                    
                    // Add block number and transaction hash to each BRC20 entry
                    parsedData.blockHeight = txData.status.block_height;
                    parsedData.txHash = txData.txid;
                    
                    return parsedData;
                }
                return null;
            }).filter(data => data !== null);
        });

        return brc20Data;
    },

    // Fetch all transaction IDs for a given block hash.
    fetchBlockTxs: async function(blockHash) {
        try {
            const data = await this.httpRequest(`${this.getEndpoint()}/block/${blockHash}/txids`);
            return this.isValidJSON(data) ? JSON.parse(data) : null;
        } catch (error) {
            this.switchEndpoint(); // Switch to another endpoint in case of error.
            throw error;
        }
    },

    // Main function to process blocks and extract BRC20 data.
    main: async function(startingBlockHeight = 785993) {
        // ... (similar to your previous version)
    },

    // Function to periodically refresh data.
    refreshData: async function(interval = 5 * 60 * 1000) {
        while (true) {
            await this.main();
            await this.sleep(interval);
        }
    }
};

// Start the indexer.
const startingBlockHeight = process.argv[2] ? parseInt(process.argv[2]) : 785993;
oshindexer.refreshData();

