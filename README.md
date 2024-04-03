# NFTMarketplaceDApp

Welcome to NFTMarketplaceDApp, a decentralized application (DApp) built on the Ethereum blockchain, designed to empower the trading, minting, buying, selling, and auctioning of digital assets through Non-Fungible Tokens (NFTs). Our goal is to leverage blockchain technology to provide a secure, transparent platform for creators and collectors alike.

## Features

### NFT Contract Development (ERC-721)
- **Minting**: Create unique digital assets with specific identifiers and metadata.
- **Batch Minting**: Efficiently mint multiple NFTs to save on gas fees.
- **Royalties and Ownership**: Implement royalty systems for creators and secure transfer of NFT ownership.

### Marketplace Contract
- **Trading Mechanisms**: Buy, sell, and auction NFTs with built-in bidding functions and time-based auctions.
- **User Interactions**: Direct purchase offers and secure transactions between users.

### Backend Integration and React Frontend
- **Web3 Integration**: Utilize web3.js for backend services to interact with Ethereum smart contracts.
- **React Frontend**: Build a dynamic, responsive UI with React to enhance user experience on the DApp.
- **Wallet Integration**: Connect with Ethereum wallets for user authentication and transaction processing.

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- Truffle
- Ganache (for a local Ethereum blockchain)
- An Ethereum wallet like MetaMask

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/nft-marketplace-dapp.git
```

2. **Install Dependencies**
```bash
npm install
```

3. **Compile Smart Contracts**
```bash
truffle compile
```

4. **Deploy to Local Blockchain (Ganache)**
```bash
truffle migrate --reset
```

5. **Deploy to Sepolia Testnet**
Adjust your `truffle-config.js` to include the Sepolia network configurations and deploy using:
```bash
truffle migrate --network sepolia
```

### Running Tests

Run automated tests to ensure your smart contracts function as expected.

```bash
truffle test
```

### Running the React Frontend

Navigate to the frontend directory and start the React application.

```bash
cd client
npm start
```

## Deployment to Sepolia Testnet

Ensure you have the following for deploying to Sepolia:
- Sepolia network added to your MetaMask.
- Sepolia test ETH for gas fees.

## Built With

- [Solidity](https://docs.soliditylang.org/en/v0.8.3/) - Smart contract programming language.
- [Node.js](https://nodejs.org/) - The runtime environment.
- [web3.js](https://web3js.readthedocs.io/) - Ethereum JavaScript API.
- [React](https://reactjs.org/) - Frontend library for building user interfaces.