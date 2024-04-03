module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost
      port: 8545, // Standard Ethereum port (Ganache GUI)
      network_id: "*" // Any network
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(
          privateKeys.split(','), // array of private keys
          `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}` // Url to an Ethereum node
        )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 4
    }
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
