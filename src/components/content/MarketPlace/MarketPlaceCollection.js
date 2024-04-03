import React, { useContext, useEffect, useState } from 'react';

import MarketplaceContext from '../../../providers/MarketplaceProvider';
import Web3Context from '../../../providers/Web3Provider';
import BuyMarketItemForm from './BuyMarketItemForm';
import RemoveMarketItemForm from './RemoveMarketItemForm';
import BidOnAuctionItemForm from './BidOnAuctionItemForm';
import EndMarketAuctionForm from './EndMarketAuctionForm';
import eth from '../../../img/eth.png';
import { fromWei } from '../../../utils/helper'

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
            {selectedAction ? (
                renderForm()
            ) : (
                <>
                    <h2>Market Items</h2>
                    <div className="row text-center">
                        {marketplaceContext.marketItems?.map((item) => (
                            <div key={item.itemId} className="col-md-4 m-3 pb-3 card border-info">
                                <div className="card-body">
                                    <h5 className="card-title">{item.title}</h5>
                                    <img src={`https://ipfs.infura.io/ipfs/${item.img}`} className="card-img-bottom" alt={item.itemId} />
                                    <p className="fw-light fs-6">{`${item.seller.substr(0, 7)}...${item.seller.substr(item.seller.length - 7)}`}</p>
                                    <div className="col-7 d-flex justify-content-end">
                                        <img src={eth} width="25" height="25" className="align-center float-start" alt="price icon"></img>
                                        <p className="text-start"><b>{`${fromWei(item.price)}`}</b></p>
                                    </div>
                                    {web3Context.account !== item.seller && (
                                        <button onClick={() => handleActionSelect('buy', item.itemId)}>Buy</button>
                                    )}
                                    {web3Context.account === item.seller && (
                                        <button onClick={() => handleActionSelect('remove', item.itemId)}>Remove from Market</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <hr />
                    <h2>Auction Items</h2>
                    <div className="row text-center">
                        {marketplaceContext.auctionItems?.map((item) => (
                            <div key={item.itemId} className="col-md-4 m-3 pb-3 card border-info">
                                <div className="card-body">
                                    <h5 className="card-title">{item.title}</h5>
                                    <img src={`https://ipfs.infura.io/ipfs/${item.img}`} className="card-img-bottom" alt={item.itemId} />
                                    <p className="fw-light fs-6">{`${item.seller.substr(0, 7)}...${item.seller.substr(item.seller.length - 7)}`}</p>
                                    <div className="col-7 d-flex justify-content-end">
                                        <img src={eth} width="25" height="25" className="align-center float-start" alt="price icon"></img>
                                        <p className="text-start">Highest Bid: <b>{`${fromWei(item.highestBid)}`}</b></p>
                                    </div>
                                    {web3Context.account !== item.seller && (
                                        <button onClick={() => handleActionSelect('bid', item.itemId)}>Bid</button>
                                    )}
                                    {web3Context.account === marketplaceContext.owner && (
                                        <button onClick={() => handleActionSelect('endAuction', item.itemId)}>End Auction</button>
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
