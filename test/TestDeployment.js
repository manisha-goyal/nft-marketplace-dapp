const MyNFT = artifacts.require("MyNFT");
const NFTMarketplace = artifacts.require("NFTMarketplace");

contract("Deployment", accounts => {
  let myNftInstance;
  let marketplaceInstance;

  before(async () => {
    marketplaceInstance = await NFTMarketplace.deployed();
    myNftInstance = await MyNFT.deployed();
  });

  it("has the correct name", async () => {
    const name = await myNftInstance.name();
    assert.equal(name, "MyNFT", "The NFT name is not correct");
  });

  it("has the correct symbol", async () => {
    const symbol = await myNftInstance.symbol();
    assert.equal(symbol, "MNFT", "The NFT symbol is not correct");
  });

  it("NFT has marketplace", async () => {
    const marketplaceAddress = await myNftInstance.getMarketplaceAddress();
    assert.equal(marketplaceAddress, marketplaceInstance.address, "The NFT does not have a marketplace");
  });

  it("the deployer is the marketplace owner", async () => {
    const owner = await marketplaceInstance.getMarketplaceOwner();
    assert.equal(owner, accounts[0], "The deployer is not the marketplace owner");
  });
});