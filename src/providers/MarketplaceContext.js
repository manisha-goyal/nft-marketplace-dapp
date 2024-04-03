import React from 'react';

const MarketplaceContext = React.createContext({
    contract: null,
	marketItems: [],
	auctionItems: [],
	listingFee: null,
	owner: null,
	mktIsLoading: true,
    loadContract: () => { },
    loadListingFee: () => { },
    loadOwner: () => { },
    loadMarketItems: () => { },
    loadAuctionItems: () => { },
    setMktIsLoading: () => { }
});

export default MarketplaceContext;