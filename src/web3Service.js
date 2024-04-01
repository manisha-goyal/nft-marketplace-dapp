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

async function mintNFT(toAddress, tokenURI, royalty) {
    await initContracts();
    return nftInstance.mintNFT(toAddress, tokenURI, royalty, { from: process.env.ACCOUNT_ADDRESS });
}

async function getNFT(tokenId) {
  await initContracts();
  return nftInstance.tokenURI(tokenId);
}

async function listNFT(tokenId, price, seller) {
  await initContracts();
  const listingFee = await marketplaceInstance.getMarketplaceListingFee({from: seller});
  return marketplaceInstance.createMarketItem(nftInstance.address, tokenId, web3.utils.toWei(price, 'ether'), {from: seller, value: listingFee});
}

async function buyNFT(itemId, buyer) {
  await initContracts();
  const item = await marketplaceInstance.getMarketItemById(itemId);
  return marketplaceInstance.createMarketSale(nftInstance.address, itemId, {from: buyer, value: item.price});
}

module.exports = {
  getNFT,
  listNFT,
  buyNFT,
  mintNFT,
};