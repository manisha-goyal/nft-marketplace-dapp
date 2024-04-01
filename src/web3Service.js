require('dotenv').config();
const Web3 = require('web3');
const contract = require('@truffle/contract');

const web3Provider = new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER);
const web3 = new Web3(web3Provider);

const NFTArtifact = require('../build/contracts/MyNFT.json');
const MarketplaceArtifact = require('../build/contracts/NFTMarketplace.json');

const NFTContract = contract(NFTArtifact);
NFTContract.setProvider(web3Provider);
const MarketplaceContract = contract(MarketplaceArtifact);
MarketplaceContract.setProvider(web3Provider);

let nftInstance;
let marketplaceInstance;

async function initContracts() {
  nftInstance = await NFTContract.at(process.env.NFT_CONTRACT_ADDRESS);
  marketplaceInstance = await MarketplaceContract.at(process.env.MARKETPLACE_CONTRACT_ADDRESS);
}

async function getNFT(tokenId) {
  await initContracts();
  return nftInstance.tokenURI(tokenId);
}

async function mintNFT(toAddress, tokenURI, royalty) {
  await initContracts();
  return nftInstance.mintNFT(toAddress, tokenURI, royalty, { from: process.env.ACCOUNT_ADDRESS });
}

async function batchMintNFTs(toAddresses, tokenURIs, royalties) {
  await initContracts();
  return nftInstance.batchMint(toAddresses, tokenURIs, royalties, { from: process.env.ACCOUNT_ADDRESS });
}

async function enableNFTTransfer(tokenId) {
  await initContracts();
  return nftInstance.enableTransfer(tokenId, { from: process.env.ACCOUNT_ADDRESS });
}

async function disableNFTTransfer(tokenId) {
  await initContracts();
  return nftInstance.disableTransfer(tokenId, { from: process.env.ACCOUNT_ADDRESS });
}

async function updateTokenRoyalty(tokenId, newRoyalty) {
  await initContracts();
  return nftInstance.updateTokenRoyalty(tokenId, newRoyalty, { from: process.env.ACCOUNT_ADDRESS });
}

async function getRoyaltyInfo(tokenId, salePrice) {
  await initContracts();
  return nftInstance.royaltyInfo(tokenId, salePrice);
}

async function getAvailableMarketNFTs() {
  await initContracts();
  return marketplaceInstance.getAvailableMarketItems();
}

async function getAvailableAuctionNFTs() {
  await initContracts();
  return marketplaceInstance.getAvailableAuctionItems();
}

async function getMarketplaceListingFee() {
  await initContracts();
  return marketplaceInstance.getMarketplaceListingFee();
}

async function listNFTOnMarketplace(tokenId, price, seller) {
  await initContracts();
  const listingFee = await marketplaceInstance.getMarketplaceListingFee({from: seller});
  return marketplaceInstance.createMarketItem(nftInstance.address, tokenId, web3.utils.toWei(price, 'ether'), {from: seller, value: listingFee});
}

async function removeNFTFromMarketplace(itemId) {
  await initContracts();
  const listingFee = await marketplaceInstance.getMarketplaceListingFee({from: seller});
  return marketplaceInstance.removeMarketItem(nftInstance.address, itemId, {from: seller, value: listingFee});
}

async function buyNFTFromMarketplace(itemId, buyer) {
  await initContracts();
  const item = await marketplaceInstance.getMarketItemById(itemId);
  return marketplaceInstance.createMarketSale(nftInstance.address, itemId, {from: buyer, value: item.price});
}

async function auctionNFTOnMarketplace(tokenId, price, auctionEndTime, seller) {
  await initContracts();
  const listingFee = await marketplaceInstance.getMarketplaceListingFee({from: seller});
  return marketplaceInstance.createAuctionItem(nftInstance.address, tokenId, web3.utils.toWei(price, 'ether'), auctionEndTime, {from: seller, value: listingFee});
}

async function bidOnNFTAuction(itemId, bid, bidder) {
  await initContracts();
  return marketplaceInstance.bidOnAuction(itemId, {from: bidder, value: bid});
}

async function endNFTAuction(itemId, seller) {
  await initContracts();
  return marketplaceInstance.endAuction(itemId, { from: seller });
}

module.exports = {
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
};