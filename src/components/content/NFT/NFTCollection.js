import React, { useContext, useState } from 'react'; // Import useState

import Web3Context from '../../../store/web3-context';
import NFTContext from '../../../provider/NFTProvider';
import CreateMarketItemForm from '../MarketPlace/CreateMarketItemForm';
import CreateAuctionItemForm from '../MarketPlace/CreateAuctionItemForm';

const NFTCollection = () => {
    const web3Context = useContext(Web3Context);
    const nftContext = useContext(NFTContext);

    // State for tracking selected action and token ID
    const [selectedAction, setSelectedAction] = useState('');
    const [selectedTokenId, setSelectedTokenId] = useState(null);

    // Handler to set selected action and token ID
    const handleActionSelect = (action, tokenId) => {
        setSelectedAction(action);
        setSelectedTokenId(tokenId);
    };

    // Function to render the appropriate form based on action
    const renderForm = () => {
        switch (selectedAction) {
            case 'market':
                return <CreateMarketItemForm tokenId={selectedTokenId} />;
            case 'auction':
                return <CreateAuctionItemForm tokenId={selectedTokenId} />;
            default:
                return null;
        }
    };

    return (
        <div>
            {selectedAction ? (
                renderForm()
            ) : (
                <>
                    <h2>NFT Collection</h2>
                    <div className="row text-center">
                        {nftContext.nftCollection?.map((NFT) => {
                            const owner = NFT.owner;
                            return (
                                <div key={NFT.tokenId} className="col-md-2 m-3 pb-3 card border-info">
                                    <div className="card-body">
                                        <h5 className="card-title">{NFT.title}</h5>
                                        <img src={`https://ipfs.infura.io/ipfs/${NFT.img}`} className="card-img-bottom" alt={`NFT ${NFT.tokenId}`} />
                                        <p className="fw-light fs-6">{`${owner.substr(0, 7)}...${owner.substr(owner.length - 7)}`}</p>
                                        {owner === web3Context.account && (
                                            <>
                                                <button className="btn btn-secondary m-2" onClick={() => handleActionSelect('market', NFT.tokenId)}>
                                                    LIST ON MARKETPLACE
                                                </button>
                                                <button className="btn btn-secondary m-2" onClick={() => handleActionSelect('auction', NFT.tokenId)}>
                                                    LIST FOR AUCTION
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default NFTCollection;
