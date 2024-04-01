#!/bin/bash

# Load environment variables
set -a
source .env
set +a

# Define the server URL
SERVER_URL=http://localhost:${PORT}

### Mint NFT
echo -e "\n\nMinting NFT"
curl -X POST "${SERVER_URL}/api/nft/mint-nft" \
-H "Content-Type: application/json" \
-d '{"toAddress":"'"${ACCOUNT_ADDRESS1}"'", "tokenURI":"https://example.com/nft1.json", "royalty":100}'

### Fetch NFT Data
echo -e "\n\nFetching NFT Data"
curl -X POST "${SERVER_URL}/api/nft/fetch-nft" \
-H "Content-Type: application/json" \
-d '{"tokenId":"1"}'

### Batch Mint NFTs
echo -e "\n\nBatch Minting NFTs"
curl -X POST "${SERVER_URL}/api/nft/batch-mint-nfts" \
-H "Content-Type: application/json" \
-d '{"toAddresses":["'"${ACCOUNT_ADDRESS2}"'", "'"${ACCOUNT_ADDRESS3}"'"], "tokenURIs":["https://example.com/nft2.json", "https://example.com/nft3.json"], "royalties":[100, 200]}'

### Fetch NFT Data
echo -e "\n\nFetching NFT Data"
curl -X POST "${SERVER_URL}/api/nft/fetch-nft" \
-H "Content-Type: application/json" \
-d '{"tokenId":"2"}'

### Fetch NFT Data
echo -e "\n\nFetching NFT Data"
curl -X POST "${SERVER_URL}/api/nft/fetch-nft" \
-H "Content-Type: application/json" \
-d '{"tokenId":"3"}'

### Disable NFT Transfer
echo -e "\n\nDisabling NFT Transfer"
curl -X POST "${SERVER_URL}/api/nft/disable-nft-transfer" \
-H "Content-Type: application/json" \
-d '{"tokenId":"3"}'

### Get Royalty Info
echo -e "\n\nGetting Royalty Info"
curl -X POST "${SERVER_URL}/api/nft/royalty-info" \
-H "Content-Type: application/json" \
-d '{"tokenId":"2", "salePrice":"1000000000000000000"}'

### Get Available Market NFTs
echo -e "\n\nGetting Available Market NFTs"
curl "${SERVER_URL}/api/marketplace/available-market-nfts"

### Get Available Auction NFTs
echo -e "\n\nGetting Available Auction NFTs"
curl "${SERVER_URL}/api/marketplace/available-auction-nfts"

### Get Marketplace Listing Fee
echo -e "\n\nGetting Marketplace Listing Fee"
curl "${SERVER_URL}/api/marketplace/marketplace-listing-fee"

### List NFT on Marketplace
echo -e "\n\nListing NFT on Marketplace"
curl -X POST "${SERVER_URL}/api/marketplace/list-nft-on-marketplace" \
-H "Content-Type: application/json" \
-d '{"tokenId":"1", "price":"0.1"}'

### List NFT on Marketplace
echo -e "\n\nListing NFT on Marketplace"
curl -X POST "${SERVER_URL}/api/marketplace/list-nft-on-marketplace" \
-H "Content-Type: application/json" \
-d '{"tokenId":"2", "price":"0.1"}'

### Get Available Market NFTs
echo -e "\n\nGetting Available Market NFTs"
curl "${SERVER_URL}/api/marketplace/available-market-nfts"

### Remove NFT from Marketplace
echo -e "\n\nRemoving NFT from Marketplace"
curl -X POST "${SERVER_URL}/api/marketplace/remove-nft-from-marketplace" \
-H "Content-Type: application/json" \
-d '{"itemId":"2"}'

### Get Available Market NFTs
echo -e "\n\nGetting Available Market NFTs"
curl "${SERVER_URL}/api/marketplace/available-market-nfts"

### Buy NFT from Marketplace
echo -e "\n\nBuying NFT from Marketplace"
curl -X POST "${SERVER_URL}/api/marketplace/buy-nft-from-marketplace" \
-H "Content-Type: application/json" \
-d '{"itemId":"1", "askingPrice":"0.2"}'

### Auction NFT
echo -e "\n\nAuctioning NFT"
curl -X POST "${SERVER_URL}/api/marketplace/auction-nft" \
-H "Content-Type: application/json" \
-d '{"tokenId":"2", "price":"0.1", "auctionEndTime":'"$(date +%s --date='tomorrow')"'}'

### Get Available Auction NFTs
echo -e "\n\nGetting Available Auction NFTs"
curl "${SERVER_URL}/api/marketplace/available-auction-nfts"

### Bid on NFT Auction
echo -e "\n\nBidding on NFT Auction"
curl -X POST "${SERVER_URL}/api/marketplace/bid-on-nft-auction" \
-H "Content-Type: application/json" \
-d '{"itemId":"3", "bid":"0.2"}'

### End NFT Auction
echo -e "\n\nEnding NFT Auction"
curl -X POST "${SERVER_URL}/api/marketplace/end-auction
-H "Content-Type: application/json" \
-d '{"itemId":"3"}'