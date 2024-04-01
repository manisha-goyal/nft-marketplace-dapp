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
        assert.equal(item.sold, false, "NFT should not be sold yet");
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
        assert.equal(updatedItem.sold, true, "NFT should be marked as sold");
        assert.equal(updatedItem.owner, accounts[1], "Ownership was not transferred after sale");
    });

    it("creates and bids on an auction NFT", async () => {
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

    it("fetches available auction NFTs", async () => {
        let availableItems = await marketplaceInstance.getAvailableAuctionItems();
        assert.equal(availableItems.length, 1, "Should fetch one auction NFT");
        assert.equal(availableItems[0], 3, "Should fetch correct auction NFT")
    });

    it("allows a seller to remove a listed NFT before sale", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[0], "https://example.com/nft4.json", 100, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();
        const listingFee = await marketplaceInstance.getMarketplaceListingFee();
    
        const marketPlaceItemId = await marketplaceInstance.createMarketItem(myNftInstance.address, tokenId, web3.utils.toWei('1', 'ether'), { from: accounts[0], value: listingFee });
        const itemId = marketPlaceItemId.logs[0].args.itemId.toNumber();
    
        await marketplaceInstance.removeMarketItem(myNftInstance.address, itemId, { from: accounts[0] });
    
        const removedItem = await marketplaceInstance.getMarketItemById(itemId);
        assert.equal(removedItem.removed, true, "NFT should be marked as removed");
    });

    it("fetches only available market NFTs", async () => {
        let availableItems = await marketplaceInstance.getAvailableMarketItems();
        assert.equal(availableItems.length, 2, "Should only fetch one available market NFT");
    });
    
    it("ends an auction correctly and transfers ownership", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[0], "https://example.com/nft5.json", 100, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();
        const auctionEndTime = (await web3.eth.getBlock('latest')).timestamp + 86400;
        const listingFee = await marketplaceInstance.getMarketplaceListingFee();
        const marketPlaceItemId = await marketplaceInstance.createAuctionItem(myNftInstance.address, tokenId, web3.utils.toWei('0.5', 'ether'), auctionEndTime, { from: accounts[0], value: listingFee });
        const itemId = marketPlaceItemId.logs[0].args.itemId.toNumber();
        await marketplaceInstance.bidOnAuction(itemId, { from: accounts[1], value: web3.utils.toWei('1', 'ether') });
    
        const marketplaceOwner = await marketplaceInstance.getMarketplaceOwner();
        await marketplaceInstance.endAuction(itemId, { from: marketplaceOwner });
    
        const auction = await marketplaceInstance.getAuctionItemById(itemId);
        assert.equal(auction.ended, true, "Auction should be marked as ended");
        const newOwner = await myNftInstance.ownerOf(tokenId);
        assert.equal(newOwner, accounts[1], "Ownership was not transferred to the highest bidder");
    });
    
    it("fails to create a market NFT without listing fee", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[0], "https://example.com/nft6.json", 100, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();
    
        try {
            await marketplaceInstance.createMarketItem(myNftInstance.address, tokenId, web3.utils.toWei('1', 'ether'), { from: accounts[0] });
            assert.fail("Expected transaction to fail without listing fee");
        } catch (error) {
            assert(error.message.indexOf("revert") >= 0, "Expected revert error");
        }
    });

    it("correctly handles multiple bids on an auction NFT and refunds the previous highest bidder", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[0], "https://example.com/nft7.json", 100, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();;

        const auctionEndTime = (await web3.eth.getBlock('latest')).timestamp + 86400;
        const listingFee = await marketplaceInstance.getMarketplaceListingFee();
        const marketPlaceItemId = await marketplaceInstance.createAuctionItem(myNftInstance.address, tokenId, web3.utils.toWei('0.5', 'ether'), auctionEndTime, { from: accounts[0], value: listingFee });

        const itemId = marketPlaceItemId.logs[0].args.itemId.toNumber();
        await marketplaceInstance.bidOnAuction(itemId, { from: accounts[1], value: web3.utils.toWei('1', 'ether') });
        
        const secondBidAmount = web3.utils.toWei('1.5', 'ether');
        const initialBalance = await web3.eth.getBalance(accounts[1]);
        await marketplaceInstance.bidOnAuction(itemId, { from: accounts[2], value: secondBidAmount });
        
        const auction = await marketplaceInstance.getAuctionItemById(itemId);
        assert.equal(auction.highestBid.toString(), secondBidAmount, "Second bid amount does not match");
        assert.equal(auction.highestBidder, accounts[2], "Second bidder address does not match");
    
        const finalBalance = await web3.eth.getBalance(accounts[1]);
        assert(finalBalance > initialBalance, "Previous highest bidder was not refunded correctly");
    });
    
    it("ends an auction correctly and transfers ownership with multiple bids on an auction NFT", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[0], "https://example.com/nft8.json", 100, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();;

        const auctionEndTime = (await web3.eth.getBlock('latest')).timestamp + 86400;
        const listingFee = await marketplaceInstance.getMarketplaceListingFee();
        const marketPlaceItemId = await marketplaceInstance.createAuctionItem(myNftInstance.address, tokenId, web3.utils.toWei('0.5', 'ether'), auctionEndTime, { from: accounts[0], value: listingFee });

        const itemId = marketPlaceItemId.logs[0].args.itemId.toNumber();
        await marketplaceInstance.bidOnAuction(itemId, { from: accounts[1], value: web3.utils.toWei('1', 'ether') });
        
        const secondBidAmount = web3.utils.toWei('1.5', 'ether');
        await marketplaceInstance.bidOnAuction(itemId, { from: accounts[2], value: secondBidAmount });

        const marketplaceOwner = await marketplaceInstance.getMarketplaceOwner();
        await marketplaceInstance.endAuction(itemId, { from: marketplaceOwner });
    
        const auction = await marketplaceInstance.getAuctionItemById(itemId);
        assert.equal(auction.ended, true, "Auction should be marked as ended");
        const newOwner = await myNftInstance.ownerOf(tokenId);
        assert.equal(newOwner, accounts[2], "Ownership was not transferred to the highest bidder");
    });

    it("prevents buying a sold market NFT", async () => {
        const newItemId = await myNftInstance.mintNFT(accounts[0], "https://example.com/nft9.json", 100, { from: accounts[0] });
        const tokenId = newItemId.logs[0].args.tokenId.toNumber();

        const listingFee = await marketplaceInstance.getMarketplaceListingFee();
        const marketPlaceItemId = await marketplaceInstance.createMarketItem(myNftInstance.address, tokenId, web3.utils.toWei('1', 'ether'), { from: accounts[0], value: listingFee });

        const itemId = marketPlaceItemId.logs[0].args.itemId.toNumber();
        const item = await marketplaceInstance.getMarketItemById(itemId);
        const itemPrice = item.price;

        await marketplaceInstance.createMarketSale(myNftInstance.address, itemId, { from: accounts[1], value: itemPrice });
    
        try {
            await marketplaceInstance.createMarketSale(myNftInstance.address, itemId, { from: accounts[2], value: itemPrice });
            assert.fail("Expected transaction to fail for buying a sold NFT");
        } catch (error) {
            assert(error.message.indexOf("revert") >= 0, "Expected revert error for buying a sold NFT");
        }
    });

    
    
});