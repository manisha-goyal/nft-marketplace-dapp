import React, { useContext, useEffect, useState } from 'react';

import MarketplaceContext from '../../../provider/MarketplaceProvider';
import Web3Context from '../../../provider/Web3Provider';
import BuyMarketItemForm from './BuyMarketItemForm';
import RemoveMarketItemForm from './RemoveMarketItemForm';
import BidOnAuctionItemForm from './BidOnAuctionItemForm';
import EndMarketAuctionForm from './EndMarketAuctionForm';

const MarketPlaceCollection = () => {
	const marketplaceContext = useContext(MarketplaceContext);
	const web3Context = useContext(Web3Context);
	const [selectedAction, setSelectedAction] = useState('');
	const [selectedItemId, setSelectedItemId] = useState(null);

	useEffect(() => {
		marketplaceContext.loadMarketItems();
		marketplaceContext.loadAuctionItems();
	}, [marketplaceContext]);

	const handleActionSelect = (action, itemId) => {
		setSelectedAction(action);
		setSelectedItemId(itemId);
	};

	const renderForm = () => {
		switch (selectedAction) {
			case 'buy':
				return <BuyMarketItemForm itemId={selectedItemId} />;
			case 'remove':
				return <RemoveMarketItemForm itemId={selectedItemId} />;
			case 'bid':
				return <BidOnAuctionItemForm itemId={selectedItemId} />;
			case 'endAuction':
				return <EndMarketAuctionForm itemId={selectedItemId} />;
			default:
				return null;
		}
	};

	return (
        <div>
            {formType ? (
                renderForm()
            ) : (
                <>
                    <h2>Market Items</h2>
                    <div className="row text-center">
                        {marketItems?.map((item) => (
                            <div key={item.itemId} className="col-md-4 m-3 pb-3 card border-info">
                                <div className="card-body">
                                    <h5 className="card-title">{item.title}</h5>
                                    <img src={`https://ipfs.infura.io/ipfs/${item.img}`} className="card-img-bottom" alt={item.itemId} />
                                    <p className="fw-light fs-6">{`${item.owner.substr(0, 7)}...${item.owner.substr(item.owner.length - 7)}`}</p>
									<p>Price: {item.price}</p>
                                    {account !== item.owner && (
                                        <button onClick={() => handleBuy(item.itemId)}>Buy</button>
                                    )}
                                    {account === item.seller && (
                                        <button onClick={() => handleRemove(item.itemId)}>Remove from Market</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <hr />
                    <h2>Auction Items</h2>
                    <div className="row text-center">
                        {auctionItems?.map((item) => (
                            <div key={item.itemId} className="col-md-4 m-3 pb-3 card border-info">
                                <div className="card-body">
                                    <h5 className="card-title">{item.title}</h5>
                                    <img src={`https://ipfs.infura.io/ipfs/${item.img}`} className="card-img-bottom" alt={item.itemId} />
                                    <p className="fw-light fs-6">{`${item.owner.substr(0, 7)}...${item.owner.substr(item.owner.length - 7)}`}</p>
									<p>Highest Bid: {item.highestBid}</p>
                                    <button onClick={() => handleBid(item.itemId)}>Bid</button>
                                    {account === item.seller && (
                                        <button onClick={() => handleEndAuction(item.itemId)}>End Auction</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MarketPlaceCollection;
