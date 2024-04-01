require('dotenv').config();
const Web3 = require('web3');
const contract = require('@truffle/contract');

const web3Provider = new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER);
const web3 = new Web3(web3Provider);

const NFTArtifact = require('../build/contracts/NFT.json');
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
	const listingFee = await marketplaceInstance.getMarketplaceListingFee();
}

async function getNFT(tokenId) {
	await initContracts();
	return nftInstance.tokenURI(tokenId);
}

async function mintNFT(toAddress, tokenURI, royalty) {
	await initContracts();
	return nftInstance.mintNFT(toAddress, tokenURI, royalty);
}

async function batchMintNFTs(toAddresses, tokenURIs, royalties) {
	await initContracts();
	return nftInstance.batchMint(toAddresses, tokenURIs, royalties);
}

async function enableNFTTransfer(tokenId) {
	await initContracts();
	return nftInstance.enableTransfer(tokenId);
}

async function disableNFTTransfer(tokenId) {
	await initContracts();
	return nftInstance.disableTransfer(tokenId);
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

async function listNFTOnMarketplace(tokenId, price) {
	await initContracts();
	return marketplaceInstance.createMarketItem(nftInstance.address, tokenId, web3.utils.toWei(price, 'ether'), { value: listingFee });
}

async function removeNFTFromMarketplace(itemId) {
	await initContracts();
	return marketplaceInstance.removeMarketItem(nftInstance.address, itemId, { value: listingFee });
}

async function buyNFTFromMarketplace(itemId, askingPrice) {
	await initContracts();
	const item = await marketplaceInstance.getMarketItemById(itemId);
	return marketplaceInstance.createMarketSale(nftInstance.address, itemId, { value: askingPrice });
}

async function auctionNFTOnMarketplace(tokenId, price, auctionEndTime) {
	await initContracts();
	return marketplaceInstance.createAuctionItem(nftInstance.address, tokenId, web3.utils.toWei(price, 'ether'), auctionEndTime, { value: listingFee });
}

async function bidOnNFTAuction(itemId, bid) {
	await initContracts();
	return marketplaceInstance.bidOnAuction(itemId, { value: bid });
}

async function endNFTAuction(itemId) {
	await initContracts();
	return marketplaceInstance.endAuction(itemId);
}

module.exports = {
	getNFT,
	mintNFT,
	batchMintNFTs,
	enableNFTTransfer,
	disableNFTTransfer,
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