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
        res.status(500).json({ error: error.toString() });
    }
});

app.post('/api/nft/getNft', async (req, res) => {
    const { tokenId } = req.body;

    try {
        const receipt = await getNFT(tokenId);
        res.json({ 
            message: 'NFT retrieved successfully',
            transactionReceipt: receipt
        });
    } catch (error) {
        console.error('Error retrieving NFT:', error);
        res.status(500).json({ error: error.toString() });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
