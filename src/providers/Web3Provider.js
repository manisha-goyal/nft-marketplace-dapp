import React, { useReducer, createContext } from 'react';

export const Web3Context = createContext();

const defaultWeb3State = {
	account: null,
	networkId: null,
	nftContractAddress: null,
	marketplaceContractAddress: null
};

const web3Reducer = (state, action) => {
	switch (action.type) {
        case 'ACCOUNT':
            return {
                ...state,
                account: action.account,
            };
        case 'NETWORKID':
            return {
                ...state,
                networkId: action.networkId
            };
        case 'CONTRACT_ADDRESS':
            return {
                ...state,
                nftContractAddress: action.nftContractAddress,
				marketplaceContractAddress: action.marketplaceContractAddress
            };
        default:
            return defaultWeb3State;
    }
};

const Web3Provider = props => {
	const [web3State, dispatchWeb3Action] = useReducer(web3Reducer, defaultWeb3State);

	const loadAccountHandler = async (web3) => {
		const accounts = await web3.eth.getAccounts();
		const account = accounts[0];
		dispatchWeb3Action({ type: 'ACCOUNT', account: account });
		return account;
	};

	const loadNetworkIdHandler = async (web3) => {
		const networkId = await web3.eth.net.getId();
		dispatchWeb3Action({ type: 'NETWORKID', networkId: networkId });
		return networkId;
	};

	const contractAddressesHandler = () => {
		const nftAddress = process.env.REACT_APP_NFT_CONTRACT_ADDRESS;
		const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS;
		dispatchWeb3Action({ 
			type: 'CONTRACT_ADDRESS', 
			nftContractAddress: nftAddress, 
			marketplaceContractAddress: marketplaceAddress 
		});
	};
	  
	const web3Context = {
		account: web3State.account,
		networkId: web3State.networkId,
		nftContractAddress: web3State.nftContractAddress,
		marketplaceContractAddress: web3State.marketplaceContractAddress,
		loadAccount: loadAccountHandler,
		loadNetworkId: loadNetworkIdHandler,
		loadContractAddresses: contractAddressesHandler,
	};

	return (
		<Web3Context.Provider value={web3Context}>
			{props.children}
		</Web3Context.Provider>
	);
};

export default Web3Provider;