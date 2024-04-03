import React, { useReducer, createContext } from 'react';

export const MarketplaceContext = createContext();

const defaultMarketplaceState = {
	contract: null,
	marketItems: null,
	auctionItems: null,
	listingFee: null,
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

	const loadMarketItemsHandler = async () => {
		setMktIsLoadingHandler(true);
	
		try {
			const availableItemIds = await MarketplaceState.contract.methods.getAvailableMarketItems().call();
			const marketItems = await Promise.all(availableItemIds.map(async (itemId) => {
				const item = await MarketplaceState.contract.methods.getMarketItemById(itemId).call();
				return !item.sold && !item.removed ? item : null;
			})).filter(item => item !== null);
	
			dispatchMarketplaceAction({ type: 'GET_MARKET_ITEMS', marketItems: marketItems });
		} catch (error) {
			console.error('Failed to load market items:', error);
		} finally {
			setMktIsLoadingHandler(false);
		}
	};
	
	const loadAuctionItemsHandler = async () => {
		setMktIsLoadingHandler(true);
	
		try {
			const availableAuctionItemIds = await MarketplaceState.contract.methods.getAvailableAuctionItems().call();
			const auctionItems = await Promise.all(availableAuctionItemIds.map(async (itemId) => {
				const item = await MarketplaceState.contract.methods.getAuctionItemById(itemId).call();
				return !item.ended? item : null;
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
		marketItems: MarketplaceState.marketItems,
		auctionItems: MarketplaceState.auctionItems,
		mktIsLoading: MarketplaceState.mktIsLoading,
		loadContract: loadContractHandler,
		loadListingFee: loadListingFeeHandler,
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