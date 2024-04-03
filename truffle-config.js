require('dotenv').config();

const HDWalletProvider = require('@truffle/hdwallet-provider');
const infuraUrl = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;
const privateKeys = [process.env.WALLET_PRIVATE_KEY]

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost
      port: 8545, // Standard Ethereum port (Ganache GUI)
      network_id: "*" // Any network
    },
    sepolia: {
      provider: () => new HDWalletProvider(privateKeys, infuraUrl),
      network_id: 11155111,
      gasPrice: 10e9,
    },
  },
  contracts_directory: './contracts',
  contracts_build_directory: './build',
  compilers: {
    solc: {
      version: "^0.8.0",
      evmVersion: "london"
    },
  },
};
