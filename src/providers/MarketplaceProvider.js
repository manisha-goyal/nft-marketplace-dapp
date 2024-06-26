import React, { useReducer } from 'react';

import MarketplaceContext from './MarketplaceContext';

const defaultMarketplaceState = {
	contract: null,
	marketItems: [],
	auctionItems: [],
	listingFee: null,
	owner: null,
	mktIsLoading: true
};

const marketplaceReducer = (state, action) => {
	switch (action.type) {
		case 'CONTRACT':
			return {
				...state,
				contract: action.contract
			};
		case 'GET_MARKET_ITEMS':
			return {
				...state,
				marketItems: action.marketItems
			};
		case 'GET_AUCTION_ITEMS':
			return {
				...state,
				auctionItems: action.auctionItems
			};
		case 'GET_LISTING_FEE':
			return {
				...state,
				listingFee: action.listingFee
			};
		case 'GET_OWNER':
			return {
				...state,
				owner: action.owner
			};
		case 'CREATE_MARKET_ITEM':
			return state;
		case 'REMOVE_MARKET_ITEM':
			return state;
		case 'CREATE_AUCTION_ITEM':
			return state;
		case 'BUY_MARKET_ITEM':
			return state;
		case 'BID_ON_AUCTION':
			return state;
		case 'END_AUCTION':
			return state;
		case 'LOADING':
			return {
				...state,
				mktIsLoading: action.loading
			};
		default:
			return defaultMarketplaceState;
	}
};

const MarketplaceProvider = props => {
	const [MarketplaceState, dispatchMarketplaceAction] = useReducer(marketplaceReducer, defaultMarketplaceState);

	const loadContractHandler = (web3, NFTMarketplace, deployedNetwork) => {
		if (!web3 || !NFTMarketplace.abi || !deployedNetwork?.address) {
			console.error("Can't load contract without web3, ABI, and network address");
			return;
		}

		const contract = new web3.eth.Contract(NFTMarketplace.abi, deployedNetwork.address);
		dispatchMarketplaceAction({ type: 'CONTRACT', contract: contract });
	};

	const loadListingFeeHandler = async () => {
		const listingFee = await MarketplaceState.contract.methods.getMarketplaceListingFee().call();
		dispatchMarketplaceAction({ type: 'GET_LISTING_FEE', listingFee: listingFee });
	};

	const loadOwnerHander = async () => {
		const owner = await MarketplaceState.contract.methods.getMarketplaceOwner().call();
		dispatchMarketplaceAction({ type: 'GET_OWNER', owner: owner });
	};

	const loadMarketItemsHandler = async (nftContract) => {
		setMktIsLoadingHandler(true);

		try {
			const availableItemIds = await MarketplaceState.contract.methods.getAvailableMarketItems().call();
			const marketItemsWithMetadata = await Promise.all(availableItemIds.map(async (itemId) => {
				const item = await MarketplaceState.contract.methods.getMarketItemById(itemId).call();
				if (!item.sold && !item.removed) {
					const tokenURI = await nftContract.methods.tokenURIs(item.tokenId).call();
					const metadataResponse = await fetch(`https://ipfs.infura.io/ipfs/${tokenURI}`);
					const metadata = await metadataResponse.json();
					return {
						itemId: item.itemId,
						title: metadata.properties.name.description,
						img: metadata.properties.image.description,
						royalty: metadata.properties.royalty.description,
						tokenId: item.tokenId,
						seller: item.seller,
						owner: item.owner,
						price: item.price,
					};
				} else {
					return null;
				}
			})).filter(item => item !== null);

			dispatchMarketplaceAction({ type: 'GET_MARKET_ITEMS', marketItems: marketItemsWithMetadata });
		} catch (error) {
			console.error('Failed to load market items:', error);
		} finally {
			setMktIsLoadingHandler(false);
		}
	};

	const loadAuctionItemsHandler = async (nftContract) => {
		setMktIsLoadingHandler(true);

		try {
			const availableAuctionItemIds = await MarketplaceState.contract.methods.getAvailableAuctionItems().call();
			const auctionItems = await Promise.all(availableAuctionItemIds.map(async (itemId) => {
				const item = await MarketplaceState.contract.methods.getAuctionItemById(itemId).call();
				if (!item.ended) {
					const tokenURI = await nftContract.methods.tokenURI(item.tokenId).call();
					const response = await fetch(`https://ipfs.infura.io/ipfs/${tokenURI}`);
					const metadata = await response.json();
					const owner = await nftContract.methods.ownerOf(item.tokenId).call();

					return {
						itemId: item.itemId,
						title: metadata.properties.name.description,
						img: metadata.properties.image.description,
						royalty: metadata.properties.royalty.description,
						tokenId: item.tokenId,
						seller: item.seller,
						owner: owner,
						highestBid: item.highestBid,
						highestBidder: item.highestBidder,
						auctionEnd: item.auctionEndTime,
					};
				}
				return null;
			})).filter(item => item !== null);

			dispatchMarketplaceAction({ type: 'GET_AUCTION_ITEMS', auctionItems: auctionItems });
		} catch (error) {
			console.error('Failed to load auction items:', error);
		} finally {
			setMktIsLoadingHandler(false);
		}
	};

	const setMktIsLoadingHandler = (loading) => {
		dispatchMarketplaceAction({ type: 'LOADING', loading: loading });
	};

	const marketplaceContext = {
		contract: MarketplaceState.contract,
		listingFee: MarketplaceState.listingFee,
		owner: MarketplaceState.owner,
		marketItems: MarketplaceState.marketItems,
		auctionItems: MarketplaceState.auctionItems,
		mktIsLoading: MarketplaceState.mktIsLoading,
		loadContract: loadContractHandler,
		loadListingFee: loadListingFeeHandler,
		loadOwner: loadOwnerHander,
		loadMarketItems: loadMarketItemsHandler,
		loadAuctionItems: loadAuctionItemsHandler,
		setMktIsLoading: setMktIsLoadingHandler
	};

	return (
		<MarketplaceContext.Provider value={marketplaceContext}>
			{props.children}
		</MarketplaceContext.Provider>
	);
};

export default MarketplaceProvider;