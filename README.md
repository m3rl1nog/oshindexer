---

# OSHIndexer: BRC-20 Javascript Node Package Indexer

**Author:** m3rl1n 

## Introduction

Introducing OSHIndexer, a lightweight and efficient BRC-20 Javascript Node Package. This indexer is designed to extract BRC20 data leveraging the Blockstream API or a custom Esplora endpoint, all in under 200 lines of code.

## Prerequisites

- Node.js
- npm

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/m3rl1n/oshindexer.git
   ```

2. **Navigate to the Directory and Install Dependencies**:
   ```bash
   cd oshindexer
   npm install
   ```

## Usage

1. **Default Usage with Blockstream API**:
   ```bash
   node oshindexer.js
   ```

2. **Set a Blockstream API Key**:
   In the script, use:
   ```javascript
   oshindexer.setApiKey('<YOUR_API_KEY>');
   ```

3. **Specify a Custom Esplora Endpoint**:
   In the script, use:
   ```javascript
   oshindexer.setEsploraEndpoint('<YOUR_ESPLORA_ENDPOINT>');
   ```

4. **Run the SDK from a Specific Block**:
   ```bash
   node oshindexer.js <BLOCK_NUMBER>
   ```

## Enhanced Features

- **Data Extraction**: Efficiently fetches BRC20 data from either the Blockstream API or any custom Esplora endpoint you provide.
  
- **Configuration Flexibility**: Easily set a Blockstream API key or switch to a custom Esplora endpoint as per your needs.
  
- **Data Storage**: After processing each block, the BRC20 data is conveniently saved to an `indexer.json` file. This file now also includes the block number (`blockHeight`) and the transaction hash (`txHash`) for each BRC20 entry.
  
- **Error Handling**: The indexer is designed to gracefully handle errors and blocks that are not found, with built-in retry mechanisms.

## Conclusion

OSHIndexer embodies the spirit of decentralization and transparency. It empowers users to seamlessly index and analyze BRC20 data. In the world of blockchain, code truly is law.
