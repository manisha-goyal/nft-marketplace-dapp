import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import web3 from './connection/web3';
import Navbar from './components/layout/Navbar';
import NFTMain from './components/content/NFT/NFTMain';
import MarketMain from './components/content/MarketPlace/MarketMain';
import Web3Context from './providers/Web3Context';
import NFTContext from './providers/NFTContext';
import MarketplaceContext from './providers/MarketplaceContext'
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
			const nftContract = await nftContext.loadContract(web3, NFT, nftDeployedNetwork);
			const mktDeployedNetwork = NFTMarketplace.networks[networkId];
			const marketplaceContract = await marketplaceContext.loadContract(web3, NFTMarketplace, mktDeployedNetwork);

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
				await marketplaceContext.loadMarketItems();
				await marketplaceContext.loadAuctionItems();

				marketplaceContract.events.MarketItemCreated()
					.on('data', () => {
						marketplaceContext.loadMarketItems();
						marketplaceContext.setMktIsLoading(false);
					})
					.on('error', (error) => {
						console.log(error);
					});

				marketplaceContract.events.AuctionItemCreated()
					.on('data', () => {
						marketplaceContext.loadAuctionItems();
						marketplaceContext.setMktIsLoading(false);
					})
					.on('error', (error) => {
						console.log(error);
					});

				marketplaceContract.events.MarketSaleCreated()
					.on('data', () => {
						marketplaceContext.loadAuctionItems();
						nftContext.getNFTCollection();
						nftContext.setNftIsLoading(false);
						marketplaceContext.setMktIsLoading(false);
					})
					.on('error', (error) => {
						console.log(error);
					});

				marketplaceContract.events.BidPlaced()
					.on('data', () => {
						marketplaceContext.loadAuctionItems();
						marketplaceContext.setMktIsLoading(false);
					})
					.on('error', (error) => {
						console.log(error);
					});

				marketplaceContract.events.AuctionEnded()
					.on('data', () => {
						marketplaceContext.loadAuctionItems();
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

			await nftContext.setNftIsLoading(false);
			await marketplaceContext.setMktIsLoading(false);
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
	const showContent = showNavbar && web3Context.account;

	return (
		<BrowserRouter>
			{showNavbar && <Navbar />}
			{showContent && (
				<React.Fragment>
					<nav>
						<ul>
							<li>
								<Link to="/nft">NFT Collection</Link>
							</li>
							<li>
								<Link to="/market">Marketplace</Link>
							</li>
						</ul>
					</nav>
					<Routes>
						<Route path="/nft" element={<NFTMain />} />
						<Route path="/market" element={<MarketMain />} />
						<Route path="/" element={<div>Select a page</div>} />
					</Routes>
				</React.Fragment>
			)}
		</BrowserRouter>
	);
};

export default App;