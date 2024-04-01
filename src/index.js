require('dotenv').config();
const express = require('express');
const {
    getNFT,
    mintNFT,
    batchMintNFTs,
    enableNFTTransfer,
    disableNFTTransfer,
    updateTokenRoyalty,
    getRoyaltyInfo,
    getAvailableMarketNFTs,
    getAvailableAuctionNFTs,
    getMarketplaceListingFee,
    listNFTOnMarketplace,
    removeNFTFromMarketplace,
    buyNFTFromMarketplace,
    auctionNFTOnMarketplace,
    bidOnNFTAuction,
    endNFTAuction
} = require('./web3Service');

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.post('/api/nft/fetch-nft', async (req, res) => {
    const { tokenId } = req.body;

    try {
        const receipt = await getNFT(tokenId);
        res.json({
            message: 'NFT retrieved successfully',
            transactionReceipt: receipt
        });
    } catch (error) {
        console.error('Error fetching NFT:', error);
        res.status(500).json({ error: 'NFT not found' });
    }
});

app.post('/api/nft/mint-nft', async (req, res) => {
    const { toAddress, tokenURI, royalty } = req.body;

    try {
        const receipt = await mintNFT(toAddress, tokenURI, royalty);
        res.json({
            message: 'NFT minted successfully',
            transactionReceipt: receipt
        });
    } catch (error) {
        console.error('Error minting NFT:', error);
        res.status(500).json({ error: 'Error minting NFT' });
    }
});

app.post('/api/nft/batch-mint-nfts', async (req, res) => {
    const { toAddresses, tokenURIs, royalties } = req.body;
    try {
        const receipt = await batchMintNFTs(toAddresses, tokenURIs, royalties);
        res.json({ message: 'NFTs batch minted successfully', transactionReceipt: receipt });
    } catch (error) {
        console.error('Error batch minting NFTs:', error);
        res.status(500).json({ error: 'Error batch minting NFTs' });
    }
});

app.post('/api/nft/enable-nft-transfer', async (req, res) => {
    const { tokenId } = req.body;
    try {
        const receipt = await enableNFTTransfer(tokenId);
        res.json({ message: 'NFT transfer enabled successfully', transactionReceipt: receipt });
    } catch (error) {
        console.error('Error enabling NFT transfer:', error);
        res.status(500).json({ error: 'Error enabling NFT transfer' });
    }
});

app.post('/api/nft/disable-nft-transfer', async (req, res) => {
    const { tokenId } = req.body;
    try {
        const receipt = await disableNFTTransfer(tokenId);
        res.json({ message: 'NFT transfer disabled successfully', transactionReceipt: receipt });
    } catch (error) {
        console.error('Error disabling NFT transfer:', error);
        res.status(500).json({ error: 'Error disabling NFT transfer' });
    }
});

app.post('/api/nft/update-nft-royalty', async (req, res) => {
    const { tokenId, newRoyalty } = req.body;
    try {
        const receipt = await updateTokenRoyalty(tokenId, newRoyalty);
        res.json({ message: 'Token royalty updated successfully', transactionReceipt: receipt });
    } catch (error) {
        console.error('Error updating token royalty:', error);
        res.status(500).json({ error: 'Error updating token royalty' });
    }
});

app.post('/api/nft/royalty-info', async (req, res) => {
    const { tokenId, salePrice } = req.body;
    try {
        const royaltyInfo = await getRoyaltyInfo(tokenId, salePrice); // Assuming a sale price of 1 ether as example
        res.json({
            tokenId: tokenId,
            royaltyAmount: royaltyInfo.royaltyAmount,
            receiver: royaltyInfo.receiver
        });
    } catch (error) {
        console.error('Error fetching royalty information:', error);
        res.status(500).json({ error: 'Error fetching royalty information' });
    }
});

app.get('/api/marketplace/available-market-nfts', async (req, res) => {
    try {
        const availableNFTs = await getAvailableMarketNFTs();
        res.json({ availableNFTs });
    } catch (error) {
        console.error('Error fetching available market NFTs:', error);
        res.status(500).json({ error: 'Error fetching available market NFTs' });
    }
});

app.get('/api/marketplace/available-auction-nfts', async (req, res) => {
    try {
        const availableAuctions = await getAvailableAuctionNFTs();
        res.json({ availableAuctions });
    } catch (error) {
        console.error('Error fetching available auction NFTs:', error);
        res.status(500).json({ error: 'Error fetching available auction NFTs' });
    }
});

app.get('/api/marketplace/marketplace-listing-fee', async (req, res) => {
    try {
        const fee = await getMarketplaceListingFee();
        res.json({ listingFee: fee });
    } catch (error) {
        console.error('Error fetching marketplace listing fee:', error);
        res.status(500).json({ error: 'Error fetching marketplace listing fee' });
    }
});

app.post('/api/marketplace/list-nft-on-marketplace', async (req, res) => {
    const { itemId, price, seller } = req.body;
    try {
        const result = await listNFTOnMarketplace(itemId, price, seller);
        res.json({ message: 'NFT listed successfully on marketplace', result });
    } catch (error) {
        console.error('Error listing NFT on marketplace:', error);
        res.status(500).json({ error: 'Error listing NFT on marketplace' });
    }
});

app.post('/api/marketplace/remove-nft-from-marketplace', async (req, res) => {
    const { itemId, seller } = req.body;
    try {
        const result = await removeNFTFromMarketplace(itemId, seller);
        res.json({ message: 'NFT removed from marketplace successfully', result });
    } catch (error) {
        console.error('Error removing NFT from marketplace:', error);
        res.status(500).json({ error: 'Error removing NFT from marketplace' });
    }
});

app.post('/api/marketplace/buy-nft-from-marketplace', async (req, res) => {
    const { itemId, buyer } = req.body;
    try {
        const result = await buyNFTFromMarketplace(itemId, buyer);
        res.json({ message: 'NFT bought from marketplace successfully', result });
    } catch (error) {
        console.error('Error buying NFT from marketplace:', error);
        res.status(500).json({ error: 'Error buying NFT from marketplace' });
    }
});

app.post('/api/marketplace/auction-NFT', async (req, res) => {
    const { tokenId, price, auctionEndTime, seller } = req.body;
    try {
        const result = await auctionNFTOnMarketplace(tokenId, price, auctionEndTime, seller);
        res.json({ message: 'NFT listed for auction successfully', result });
    } catch (error) {
        console.error('Error listing NFT for auction:', error);
        res.status(500).json({ error: 'Error listing NFT for auction' });
    }
});

app.post('/api/marketplace/auction-NFT', async (req, res) => {
    const { itemId, bid, bidder } = req.body;
    try {
        const result = await bidOnNFTAuction(itemId, bid, bidder);
        res.json({ message: 'Auction bid placed on NFT successfully', result });
    } catch (error) {
        console.error('Error placing auction bid on NFT:', error);
        res.status(500).json({ error: 'Error placing auction bid on NFT' });
    }
});

app.post('/api/marketplace/end-auction', async (req, res) => {
    const { itemId, seller } = req.body;
    try {
        const result = await endNFTAuction(itemId, seller);
        res.json({ message: 'NFT auction ended successfully', result });
    } catch (error) {
        console.error('Error ending NFT auction:', error);
        res.status(500).json({ error: 'Error ending NFT auction' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});