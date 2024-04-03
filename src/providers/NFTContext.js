import React from 'react';

const NFTContext = React.createContext({
	contract: null,
	totalSupply: null,
	nftCollection: [],
	nftIsLoading: true,
	loadContract: () => { },
	getTotalSupply: () => { },
	getNFTCollection: () => { },
	setNftIsLoading: () => { }
});

export default NFTContext;