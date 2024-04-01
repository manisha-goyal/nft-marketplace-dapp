const MyNFT = artifacts.require("MyNFT");

contract("MyNFT", accounts => {
    let myNftInstance;

    const tokenURI = "https://example.com/nft.json";
    const royalty = 100;

    before(async () => {
        myNftInstance = await MyNFT.deployed();
    });

    it("should mint an NFT to the first account", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[1], tokenURI, royalty, { from: accounts[0] });    
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();
        
        const owner = await myNftInstance.ownerOf(tokenId);
        assert.equal(owner, accounts[1], "The account[1] should own the minted NFT");
    });

	it("should emit a Transfer event when an NFT is minted", async () => {
		const receipt = await myNftInstance.mintNFT(accounts[1], "https://example.com/nft.json", 100, { from: accounts[0] });
		const event = receipt.logs[0].event;
		assert.equal(event, "Transfer", "Expected Transfer event to be emitted");
	});

    it("should set the correct royalty information", async () => {
		const newItemId = await myNftInstance.mintNFT(accounts[1], "https://example.com/nft.json", 100, { from: accounts[0] });
		const tokenId = newItemId.logs[0].args.tokenId.toNumber();
	
		const royaltyInfo = await myNftInstance.royaltyInfo(tokenId, 1000);
		assert.equal(royaltyInfo.royaltyAmount.toNumber(), 10, "The royalty amount is incorrect");
		assert.equal(royaltyInfo.receiver, accounts[1], "The royalty receiver is incorrect");
	});	

	it("increases token's id after each mint", async () => {
		let receipt = await myNftInstance.mintNFT(accounts[1], "https://example.com/nft1.json", 100, { from: accounts[0] });
		let tokenId1 = receipt.logs[0].args.tokenId.toNumber();
	
		receipt = await myNftInstance.mintNFT(accounts[1], "https://example.com/nft2.json", 100, { from: accounts[0] });
		let tokenId2 = receipt.logs[0].args.tokenId.toNumber();
	
		assert(tokenId2 > tokenId1, "Token ID did not increase after minting a new NFT");
	
		receipt = await myNftInstance.mintNFT(accounts[1], "https://example.com/nft3.json", 100, { from: accounts[0] });
		let tokenId3 = receipt.logs[0].args.tokenId.toNumber();
	
		assert(tokenId3 > tokenId2, "Token ID did not increase after minting another new NFT");
	});

    it("should allow transfer if eligible", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[1], tokenURI, royalty, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();

        await myNftInstance.transferFrom(accounts[1], accounts[2], tokenId, { from: accounts[1] });
        const newOwner = await myNftInstance.ownerOf(tokenId);
        assert.equal(newOwner, accounts[2], "NFT transfer did not occur correctly");
    });

    it("should not allow transfer if not eligible", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[1], tokenURI, royalty, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();

        await myNftInstance.disableTransfer(tokenId, { from: accounts[1] });

        try {
            await myNftInstance.transferFrom(accounts[1], accounts[2], tokenId, { from: accounts[1] });
            assert.fail("The transfer should have failed but didn't.");
        } catch (error) {
            assert.include(error.message, "revert", "Expected transfer to revert due to ineligibility");
        }
    });

	it("should enable and disable transfers correctly", async () => {
		const newItemId = await myNftInstance.mintNFT(accounts[1], tokenURI, royalty, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();

		await myNftInstance.disableTransfer(tokenId, { from: accounts[1] });
		let transferEligible = await myNftInstance.transferEligible(tokenId);
		assert.equal(transferEligible, false, "Transfer should be disabled");
	
		await myNftInstance.enableTransfer(tokenId, { from: accounts[1] });
		transferEligible = await myNftInstance.transferEligible(tokenId);
		assert.equal(transferEligible, true, "Transfer should be enabled");
	});

	it("should mint multiple NFTs correctly", async () => {
		const recipients = [accounts[1], accounts[2]];
		const tokenURIs = ["https://example.com/nft4.json", "https://example.com/nft5.json"];
		const royalties = [100, 200];
	
		const receipt = await myNftInstance.mintMultipleNFTs(recipients, tokenURIs, royalties, { from: accounts[0] });
	
		const tokenId1 = receipt.logs[0].args.tokenId.toNumber();
		const tokenId2 = receipt.logs[4].args.tokenId.toNumber();

		const owner1 = await myNftInstance.ownerOf(tokenId1);
		const owner2 = await myNftInstance.ownerOf(tokenId2);
		assert.equal(owner1, accounts[1], "First NFT was not minted to the correct owner");
		assert.equal(owner2, accounts[2], "Second NFT was not minted to the correct owner");
	
		const royaltyInfo1 = await myNftInstance.royaltyInfo(tokenId1, 1000);
		assert.equal(royaltyInfo1.royaltyAmount.toNumber(), 10, "The First NFT royalty amount is incorrect");
		assert.equal(royaltyInfo1.receiver, accounts[1], "The First NFT royalty receiver is incorrect");

		const royaltyInfo2 = await myNftInstance.royaltyInfo(tokenId2, 2000);
		assert.equal(royaltyInfo2.royaltyAmount.toNumber(), 40, "The Second NFT royalty amount is incorrect");
		assert.equal(royaltyInfo2.receiver, accounts[2], "The Second NFT royalty receiver is incorrect");
	});
});
