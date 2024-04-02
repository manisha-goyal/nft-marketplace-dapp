import React, { useReducer, createContext } from 'react';

export const NFTContext = createContext();

const defaultNFTState = {
    contract: null,
    totalSupply: null,
    nftCollection: [],
    nftIsLoading: true
};

const NFTReducer = (state, action) => {
    switch (action.type) {
        case 'CONTRACT':
            return {
                ...state,
                contract: action.contract
            };
        case 'GET_SUPPLY':
            return {
                ...state,
                totalSupply: action.totalSupply
            };
        case 'GET_COLLECTION':
            return {
                ...state,
                nftCollection: action.nftCollection
            };
        case 'MINT':
            return state;
        case 'BATCH_MINT':
            return state;
        case 'LOADING':
            return {
                ...state,
                nftIsLoading: action.loading
            };
        default:
            return defaultNFTState;
    }
};

export const NFTProvider = props => {
    const [NFTState, dispatchNFTAction] = useReducer(NFTReducer, defaultNFTState);

    const loadContractHandler = (web3, NFT, deployedNetwork) => {
        if (!web3 || !NFT.abi || !deployedNetwork?.address) {
            console.error("Can't load contract without web3, ABI, and network address");
            return;
        }

        const contract = new web3.eth.Contract(NFT.abi, deployedNetwork.address);
        dispatchNFTAction({ type: 'CONTRACT', contract: contract });
    };

    const getTotalSupplyHandler = async () => {
        if (!NFTState.contract) {
            console.error("Contract not loaded");
            return;
        }

        const totalSupply = await NFTState.contract.methods.getTotalSupply().call();
        dispatchNFTAction({ type: 'GET_SUPPLY', totalSupply: totalSupply });
    };

    const getNFTCollectionHandler = async () => {
        if (!NFTState.contract) {
            console.error("Contract not loaded");
            return;
        }

        setNftIsLoadingHandler(true);

        const fetchNFTMetadataPromises = Array.from({ length: NFTState.totalSupply }, async (_, index) => {
            try {
                const tokenId = index;
                const hash = await NFTState.contract.methods.tokenURIs(tokenId).call();
                const response = await fetch(`https://ipfs.infura.io/ipfs/${hash}?clear`);

                if (!response.ok) {
                    throw new Error('Error getting NFT metadata');
                }

                const metadata = await response.json();
                const owner = await NFTState.contract.methods.ownerOf(tokenId).call();
                const creator = await NFTState.contract.methods.getNFTCreator(tokenId).call();

                return {
                    id: tokenId,
                    title: metadata.properties.name.description,
                    img: metadata.properties.image.description,
                    owner,
                    creator
                };
            } catch (error) {
                console.error(`Error getting NFT metadata for token ID ${index}:`, error);
                return null;
            }
        });

        try {
            const nftCollection = (await Promise.all(fetchNFTMetadataPromises))
                .filter(nft => nft !== null);

            dispatchNFTAction({ type: 'GET_COLLECTION', nftCollection });
        } catch (error) {
            console.error('Error getting NFT collection:', error);
        } finally {
            setNftIsLoadingHandler(false);

        }
    };

    const mintNFTHandler = async (account, tokenURI, royalty) => {
        if (!NFTState.contract || !account) {
            console.error("Contract not loaded or account not set");
            return;
        }

        setNftIsLoadingHandler(true);

        try {
            const transactionReceipt = await NFTState.contract.methods.mintNFT(account, tokenURI, royalty)
                .send({ from: account });

            console.log('NFT minted successfully:', transactionReceipt);

            await getTotalSupplyHandler();
            await getNFTCollectionHandler();
            dispatchNFTAction({ type: 'MINT' });
        } catch (error) {
            console.error('Error minting NFT:', error);
        } finally {
            setNftIsLoadingHandler(false);
        }
    };

    const batchMintNFTHandler = async (account, recipients, tokenURIs, royalties) => {
        if (!NFTState.contract || !account) {
            console.error("Contract not loaded or account not set");
            return;
        }

        setNftIsLoadingHandler(true);

        try {
            const transactionReceipt = await NFTState.contract.methods.mintMultipleNFTs(recipients, tokenURIs, royalties)
                .send({ from: account });

            console.log('NFTs batch minted successfully:', transactionReceipt);

            await getTotalSupplyHandler();
            await getNFTCollectionHandler();
            dispatchNFTAction({ type: 'BATCH_MINT' });
        } catch (error) {
            console.error('Error batch minting NFTs:', error);
        } finally {
            setNftIsLoadingHandler(false);
        }
    };

    const setNftIsLoadingHandler = (loading) => {
        dispatchNFTAction({ type: 'LOADING', loading: loading });
    };

    const nftContext = {
        contract: NFTState.contract,
        totalSupply: NFTState.totalSupply,
        nftCollection: NFTState.nftCollection,
        nftIsLoading: NFTState.nftIsLoading,
        loadContract: loadContractHandler,
        getTotalSupply: getTotalSupplyHandler,
        getNFTCollection: getNFTCollectionHandler,
        mintNFT: mintNFTHandler,
        batchMintNFTs: batchMintNFTHandler,
        setNftIsLoading: setNftIsLoadingHandler,
    };

    return (
        <NFTContext.Provider value={nftContext}>
            {props.children}
        </NFTContext.Provider>
    );
};

export default NFTProvider;