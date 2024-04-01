module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost
      port: 8545, // Standard Ethereum port (Ganache GUI)
      network_id: "*" // Any network
    },
  },
  compilers: {
    solc: {
      version: "^0.8.0",
      evmVersion: "london"
    },
  },
};
