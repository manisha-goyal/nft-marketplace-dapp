const MyNFT = artifacts.require("MyNFT");
const NFTMarketplace = artifacts.require("NFTMarketplace");

contract("NFTMarketplace", (accounts) => {
    let myNftInstance;
    let marketplaceInstance;

    before(async () => {
        marketplaceInstance = await NFTMarketplace.new();
        myNftInstance = await MyNFT.new(marketplaceInstance.address);
    });

    it("lists an NFT on the marketplace", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[0], "https://example.com/nft.json", 100, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();

        const listingFee = await marketplaceInstance.getMarketplaceListingFee();
        const marketPlaceItemId = await marketplaceInstance.createMarketItem(myNftInstance.address, tokenId, web3.utils.toWei('1', 'ether'), { from: accounts[0], value: listingFee });

        const itemId = marketPlaceItemId.logs[0].args.itemId.toNumber();
        const item = await marketplaceInstance.getMarketItemById(itemId);
        const owner = await myNftInstance.ownerOf(tokenId);
        assert.equal(item.nftContract, myNftInstance.address, "NFT contract address does not match");
        assert.equal(item.tokenId, tokenId, "Token ID does not match");
        assert.equal(item.seller, accounts[0], "Token seller is not account[0]");
        assert.equal(owner, marketplaceInstance.address, "Token owner is not the marketplace owner");
        assert.equal(item.price.toString(), web3.utils.toWei('1', 'ether'), "Price does not match");
        assert.equal(item.sold, false, "Item should not be sold yet");
    });

    it("completes a market sale", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[0], "https://example.com/nft1.json", 100, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();

        const listingFee = await marketplaceInstance.getMarketplaceListingFee();
        const marketPlaceItemId = await marketplaceInstance.createMarketItem(myNftInstance.address, tokenId, web3.utils.toWei('1', 'ether'), { from: accounts[0], value: listingFee });

        const balanceBefore = await web3.eth.getBalance(accounts[1]);
        const balance = web3.utils.fromWei(balanceBefore, 'ether');

        assert(parseFloat(balance) > 1, "Account does not have enough Ether");

        const itemId = marketPlaceItemId.logs[0].args.itemId.toNumber();
        const item = await marketplaceInstance.getMarketItemById(itemId);
        const itemPrice = item.price;

        const royaltyInfo = await myNftInstance.royaltyInfo(1, 1000);
		assert.equal(royaltyInfo.royaltyAmount.toNumber(), 10, "The royalty amount is incorrect");
		assert.equal(royaltyInfo.receiver, accounts[0], "The royalty receiver is incorrect");
    
        await marketplaceInstance.createMarketSale(myNftInstance.address, itemId, { from: accounts[1], value: itemPrice });
    
        const updatedItem = await marketplaceInstance.getMarketItemById(itemId);
        assert.equal(updatedItem.sold, true, "Item should be marked as sold");
        assert.equal(updatedItem.owner, accounts[1], "Ownership was not transferred after sale");
    });

    it("creates and bids on an auction item", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[0], "https://example.com/nft3.json", 100, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();;

        const auctionEndTime = (await web3.eth.getBlock('latest')).timestamp + 86400; // 24 hours from now
        const listingFee = await marketplaceInstance.getMarketplaceListingFee();
        const marketPlaceItemId = await marketplaceInstance.createAuctionItem(myNftInstance.address, tokenId, web3.utils.toWei('0.5', 'ether'), auctionEndTime, { from: accounts[0], value: listingFee });

        const itemId = marketPlaceItemId.logs[0].args.itemId.toNumber();
        await marketplaceInstance.bidOnAuction(itemId, { from: accounts[1], value: web3.utils.toWei('1', 'ether') });

        // Verify
        const auction = await marketplaceInstance.getAuctionItemById(itemId);
        assert.equal(auction.highestBid.toString(), web3.utils.toWei('1', 'ether'), "Bid amount does not match");
        assert.equal(auction.highestBidder, accounts[1], "Bidder address does not match");
    });

    it("allows a seller to remove a listed item before sale", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[0], "https://example.com/nft4.json", 100, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();
        const listingFee = await marketplaceInstance.getMarketplaceListingFee();
    
        const marketPlaceItemId = await marketplaceInstance.createMarketItem(myNftInstance.address, tokenId, web3.utils.toWei('1', 'ether'), { from: accounts[0], value: listingFee });
        const itemId = marketPlaceItemId.logs[0].args.itemId.toNumber();
    
        await marketplaceInstance.removeMarketItem(myNftInstance.address, itemId, { from: accounts[0] });
    
        const removedItem = await marketplaceInstance.getMarketItemById(itemId);
        assert.equal(removedItem.removed, true, "Item should be marked as removed");
    });
    
    it("ends an auction correctly and transfers ownership", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[0], "https://example.com/nft5.json", 100, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();
        const auctionEndTime = (await web3.eth.getBlock('latest')).timestamp + 86400;
        const listingFee = await marketplaceInstance.getMarketplaceListingFee();
        const marketPlaceItemId = await marketplaceInstance.createAuctionItem(myNftInstance.address, tokenId, web3.utils.toWei('0.5', 'ether'), auctionEndTime, { from: accounts[0], value: listingFee });
        const itemId = marketPlaceItemId.logs[0].args.itemId.toNumber();
        await marketplaceInstance.bidOnAuction(itemId, { from: accounts[1], value: web3.utils.toWei('1', 'ether') });
    
        await marketplaceInstance.endAuction(itemId, { from: accounts[0] });
    
        const auction = await marketplaceInstance.getAuctionItemById(itemId);
        assert.equal(auction.ended, true, "Auction should be marked as ended");
        const newOwner = await myNftInstance.ownerOf(tokenId);
        assert.equal(newOwner, accounts[1], "Ownership was not transferred to the highest bidder");
    });
    
    it("fails to create a market item without listing fee", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[0], "https://example.com/nft6.json", 100, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();
    
        try {
            await marketplaceInstance.createMarketItem(myNftInstance.address, tokenId, web3.utils.toWei('1', 'ether'), { from: accounts[0] });
            assert.fail("Expected transaction to fail without listing fee");
        } catch (error) {
            assert(error.message.indexOf("revert") >= 0, "Expected revert error");
        }
    });
    
});