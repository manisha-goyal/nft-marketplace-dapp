const MyNFT = artifacts.require("MyNFT");
const NFTMarketplace = artifacts.require("NFTMarketplace");

contract("MyNFT", accounts => {
	let myNftInstance;
  let marketplaceInstance;

	before(async () => {
		marketplaceInstance = await NFTMarketplace.deployed();
    myNftInstance = await MyNFT.deployed();
	});

	it("should mint an NFT to the first account", async () => {
		const newItemId = await myNftInstance.mintNFT(accounts[1], "test", 100, {from: accounts[0]});    
		const tokenId = newItemId.logs[0].args.tokenId.toNumber();
		
		const owner = await myNftInstance.ownerOf(tokenId);
		assert.equal(owner, accounts[1], "The account[1] should own the minted NFT");
	});
});
