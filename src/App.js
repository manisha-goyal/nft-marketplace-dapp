import React, { useContext, useEffect } from 'react';

import web3 from './connection/web3';
import Navbar from './components/Layout/Navbar';
import NFTMain from './components/content/NFT/NFTMain';
import MarketMain from './components/Content/MarketPlace/MarketMain';
import Web3Context from './providers/Web3Provider';
import NFTContext from './providers/NFTProvider';
import MarketplaceContext from './providers/MarketplaceProvider'
import NFT from './contracts/NFT.json';
import NFTMarketplace from './contracts/NFTMarketplace.json';

const App = () => {
	const web3Context = useContext(Web3Context);
	const nftContext = useContext(NFTContext);
	const marketplaceContext = useContext(MarketplaceContext);

	useEffect(() => {
		if (!web3) {
			window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
			return;
		}

		const loadBlockchainData = async () => {
			try {
				await window.ethereum.request({ method: 'eth_requestAccounts' });
			} catch (error) {
				console.error(error);
			}

			await web3Context.loadAccount(web3);
			const networkId = await web3Context.loadNetworkId(web3);

			const nftDeployedNetwork = NFT.networks[networkId];
			const nftContract = nftContext.loadContract(web3, NFT, nftDeployedNetwork);
			const mktDeployedNetwork = NFTMarketplace.networks[networkId];
			const marketplaceContract = marketplaceContext.loadContract(web3, NFTMarketplace, mktDeployedNetwork);

			await web3Context.loadContractAddresses();

			if (nftContract) {
				await nftContext.getTotalSupply();
				await nftContext.getNFTCollection();

				nftContract.events.TokenMinted()
					.on('data', () => {
						nftContext.getNFTCollection();
						nftContext.setNftIsLoading(false);
					})
					.on('error', (error) => {
						console.log(error);
					});

			} else {
				window.alert('NFT contract not deployed to detected network.')
			}

			if (marketplaceContract) {
				await marketplaceContext.loadListingFee();
				await marketplaceContext.loadMarketItemsHandler();
				await marketplaceContext.loadAuctionItemsHandler();

				marketplaceContract.events.MarketItemCreated()
					.on('data', () => {
						marketplaceContext.loadMarketItemsHandler();
						marketplaceContext.setMktIsLoading(false);
					})
					.on('error', (error) => {
						console.log(error);
					});

				marketplaceContract.events.AuctionItemCreated()
					.on('data', () => {
						marketplaceContext.loadAuctionItemsHandler();
						marketplaceContext.setMktIsLoading(false);
					})
					.on('error', (error) => {
						console.log(error);
					});

				marketplaceContract.events.MarketSaleCreated()
					.on('data', () => {
						marketplaceContext.loadMarketItemsHandler();
						nftContext.getNFTCollection();
						nftContext.setNftIsLoading(false);
						marketplaceContext.setMktIsLoading(false);
					})
					.on('error', (error) => {
						console.log(error);
					});

				marketplaceContract.events.BidPlaced()
					.on('data', () => {
						marketplaceContext.loadAuctionItemsHandler();
						marketplaceContext.setMktIsLoading(false);
					})
					.on('error', (error) => {
						console.log(error);
					});

				marketplaceContract.events.AuctionEnded()
					.on('data', () => {
						marketplaceContext.loadAuctionItemsHandler();
						nftContext.getNFTCollection();
						nftContext.setNftIsLoading(false);
						marketplaceContext.setMktIsLoading(false);
					})
					.on('error', (error) => {
						console.log(error);
					});

			} else {
				window.alert('NFTMarketplace contract not deployed to detected network.')
			}

			nftContext.setNftIsLoading(false);
			marketplaceContext.setMktIsLoading(false);
		};

		const accountsChangedHandler = (accounts) => {
			web3Context.loadAccount(web3);
		};

		const chainChangedHandler = () => {
			window.location.reload();
		};

		window.ethereum.on('accountsChanged', accountsChangedHandler);
		window.ethereum.on('chainChanged', chainChangedHandler);

		loadBlockchainData();

		return () => {
			if (window.ethereum.removeListener) {
				window.ethereum.removeListener('accountsChanged', accountsChangedHandler);
				window.ethereum.removeListener('chainChanged', chainChangedHandler);
			}
		};
	}, []);

	const showNavbar = web3 && nftContext.contract && marketplaceContext.contract;
	const showContent = web3 && nftContext.contract && marketplaceContext.contract && web3Context.account;

	return (
		<React.Fragment>
			{showNavbar && <Navbar />}
			{showContent && <NFTMain />}
			{showContent && <MarketMain />}
		</React.Fragment>
	);
};

export default App;