import React from 'react';

const Web3Context = React.createContext({
	account: null,
	networkId: null,
	nftContractAddress: null,
	marketplaceContractAddress: null,
	loadAccount: () => { },
	loadNetworkId: () => { },
	loadContractAddresses: () => { }
});

export default Web3Context;