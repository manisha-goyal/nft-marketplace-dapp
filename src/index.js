require('dotenv').config();
const express = require('express');
const { mintNFT, getNFT } = require('./web3Service');
const app = express();
const port = process.env.PORT;

app.use(express.json());

app.post('/api/nft/mint', async (req, res) => {
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

app.post('/api/nft/retrieve', async (req, res) => {
    const { tokenId } = req.body;

    try {
        const receipt = await getNFT(tokenId);
        res.json({ 
            message: 'NFT retrieved successfully',
            transactionReceipt: receipt
        });
    } catch (error) {
        console.error('Error retrieving NFT:', error);
        res.status(500).json({ error: 'NFT not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

/*
Add endpoints for NFT:

- mint NFT (done)
- retrieve NFT from ID (done)
- batch minting NFTs
- enable/disable NFT transfer
- update token royalty
- get royalty info

Add endpoints for Marketplace:

- get available market NFTs
- get available auction NFTs
- get marketplace listing fee

- listing NFT on the marketplace
- remove NFT from the marketplace
- buy NFT from marketplace

- auction NFT on marketplace
- bid on auction
- end NFT auction
*/