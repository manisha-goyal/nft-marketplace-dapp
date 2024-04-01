### Fetch NFT Data
```bash
curl -X POST http://localhost:3000/api/nft/fetch-nft \
-H "Content-Type: application/json" \
-d '{"tokenId":"1"}'
```

### Mint NFT
```bash
curl -X POST http://localhost:3000/api/nft/mint-nft \
-H "Content-Type: application/json" \
-d '{"toAddress":"0xAddress", "tokenURI":"https://example.com/nft.json", "royalty":100}'
```

### Batch Mint NFTs
```bash
curl -X POST http://localhost:3000/api/nft/batch-mint-nfts \
-H "Content-Type: application/json" \
-d '{"toAddresses":["0xAddress1", "0xAddress2"], "tokenURIs":["https://example.com/nft1.json", "https://example.com/nft2.json"], "royalties":[100, 200]}'
```

### Enable NFT Transfer
```bash
curl -X POST http://localhost:3000/api/nft/enable-nft-transfer \
-H "Content-Type: application/json" \
-d '{"tokenId":"1"}'
```

### Disable NFT Transfer
```bash
curl -X POST http://localhost:3000/api/nft/disable-nft-transfer \
-H "Content-Type: application/json" \
-d '{"tokenId":"1"}'
```

### Get Royalty Info
```bash
curl -X POST http://localhost:3000/api/nft/royalty-info \
-H "Content-Type: application/json" \
-d '{"tokenId":"1", "salePrice":"1000000000000000000"}'
```

### Get Available Market NFTs
```bash
curl http://localhost:3000/api/marketplace/available-market-nfts
```

### Get Available Auction NFTs
```bash
curl http://localhost:3000/api/marketplace/available-auction-nfts
```

### Get Marketplace Listing Fee
```bash
curl http://localhost:3000/api/marketplace/marketplace-listing-fee
```

### List NFT on Marketplace
```bash
curl -X POST http://localhost:3000/api/marketplace/list-nft-on-marketplace \
-H "Content-Type: application/json" \
-d '{"itemId":"1", "price":"0.1"}'
```

### Remove NFT from Marketplace
```bash
curl -X POST http://localhost:3000/api/marketplace/remove-nft-from-marketplace \
-H "Content-Type: application/json" \
-d '{"itemId":"1"}'
```

### Buy NFT from Marketplace
```bash
curl -X POST http://localhost:3000/api/marketplace/buy-nft-from-marketplace \
-H "Content-Type: application/json" \
-d '{"itemId":"1", "askingPrice":"0.1"}'
```

### Auction NFT
```bash
curl -X POST http://localhost:3000/api/marketplace/auction-nft \
-H "Content-Type: application/json" \
-d '{"tokenId":"1", "price":"0.1", "auctionEndTime":<Timestamp>}'
```

### Bid on NFT Auction
```bash
curl -X POST http://localhost:3000/api/marketplace/bid-on-nft-auction \
-H "Content-Type: application/json" \
-d '{"itemId":"1", "bid":"0.2"}'
```

### End NFT Auction
```bash
curl -X POST http://localhost:3000/api/marketplace/end-auction \
-H "Content-Type: application/json" \
-d '{"itemId":"1"}'
```