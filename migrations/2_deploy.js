const MyNFT = artifacts.require("MyNFT");
const NFTMarketplace = artifacts.require("NFTMarketplace");

module.exports = async function(deployer) {
    await deployer.deploy(NFTMarketplace);
    const marketplaceInstance = await NFTMarketplace.deployed();
    
    await deployer.deploy(MyNFT, marketplaceInstance.address);
};
