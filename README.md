Of course, here's the GitHub documentation for the code you provided, translated into English:

---

# OSHIndexer: BRC-20 Javascript Node Package Indexer

**Author:** m3rl1n 

## Introduction

Today, I have made open source & immortal in less than 200 lines of code the BRC-20 Javascript Node Package: OSHIndexer. An indexer for BRC20 data using the Blockstream API or a custom Esplora endpoint.

## Prerequisites

- Node.js
- npm

## Installation

1. Clone this repository:
```bash
git clone https://github.com/m3rl1n/oshindexer.git
```

2. Install the dependencies:
```bash
cd oshindexer
npm install
```

## Usage

1. To use the default Blockstream API:
```bash
node oshindexer.js
```

2. To set a Blockstream API key:
```javascript
oshindexer.setApiKey('<YOUR_API_KEY>');
```

3. To set a custom Esplora endpoint:
```javascript
oshindexer.setEsploraEndpoint('<YOUR_ESPLORA_ENDPOINT>');
```

4. To run the SDK starting from a specific block:
```bash
node oshindexer.js <BLOCK_NUMBER>
```

## Features

- Fetch BRC20 data from the Blockstream API or a custom Esplora endpoint.
- Ability to set a Blockstream API key.
- Ability to set a custom Esplora endpoint.
- Save BRC20 data to an `indexer.json` file after processing each block.
- Handle errors and not found blocks with retry attempts.

## Conclusion

This package is a step towards decentralization and transparency, allowing anyone to index and analyze BRC20 data. Code is law.

---

You can use this documentation as a README.md for your GitHub repository. Make sure to replace placeholders like `<YOUR_API_KEY>` and `<YOUR_ESPLORA_ENDPOINT>` with appropriate values when implementing.