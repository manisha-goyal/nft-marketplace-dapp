import React, { useState, useEffect, useContext } from 'react';

import Web3Context from '../../../providers/Web3Provider';
import MarketplaceContext from '../../../providers/MarketplaceProvider';

const BidOnMarketItemForm = ({itemId}) => {
    const web3Context = useContext(Web3Context);
    const marketplaceContext = useContext(MarketplaceContext);

    const [auctionItemId, setEnteredAuctionItemId] = useState('');
    const [auctionItemIdIsValid, setAuctionItemIdIsValid] = useState(true);

    const [auctionItemBid, setEnteredAuctionItemBid] = useState('');
    const [auctionItemBidIsValid, setAuctionItemBidIsValid] = useState(true);

    const auctionItemIdHandler = (event) => {
        const value = event.target.value;
        if (value >= 0) {
            setEnteredAuctionItemId(value);
            setAuctionItemIdIsValid(true);
        } else {
            setAuctionItemIdIsValid(false);
        }
    };

    const auctionItemBidHandler = (event) => {
        const value = event.target.value;
        setEnteredAuctionItemBid(value);
        setAuctionItemBidIsValid(!!value);
    };

    useEffect(() => {
		if (itemId) {
			setEnteredAuctionItemId(itemId);
			setAuctionItemIdIsValid(true);
		}
	}, [itemId]);

    const bidOnAuctionItemHandler = (event) => {
        event.preventDefault();

        const formIsValid = auctionItemIdIsValid && auctionItemBidIsValid;

        const bidOnAuctionItem = async () => {
            try {
                await marketplaceContext.contract.methods.bidOnAuction(web3Context.nftContractAddress, auctionItemId)
                    .send({ from: web3Context.account, value: auctionItemBid })
                    .on('transactionHash', (hash) => {
                        marketplaceContext.setMktIsLoading(true);
                    })
                    .on('error', (e) => {
                        window.alert('Something went wrong when bidding on market auction item');
                        marketplaceContext.setMktIsLoading(false);
                    });
                alert("Bid placed on market auction item bought successfully!");
            } catch (error) {
                console.error('Error bidding on market auction item:', error);
                alert("Failed to bid on market auction item.");
            }
        };

        formIsValid && bidOnAuctionItem();
    };

    const auctionItemIdClass = auctionItemIdIsValid ? "form-control" : "form-control is-invalid";
    const auctionItemBidClass = auctionItemBidIsValid ? "form-control" : "form-control is-invalid";

    return (
        <form onSubmit={bidOnAuctionItemHandler}>
            <div className="row justify-content-center">
                <div className="col-md-2">
                    <input
                        type='number'
                        className={`${auctionItemIdClass} mb-1`}
                        placeholder='Item ID...'
                        value={auctionItemId}
                        onChange={auctionItemIdHandler}
                        min="0"
                        step="1"
                    />
                    {!auctionItemIdIsValid && <small className="text-danger">Item ID greater than 0 must be entered</small>}
                </div>
                <div className="col-md-6">
                    <input
                        type='number'
                        className={`${auctionItemBidClass} mb-1`}
                        placeholder='Bid price...'
                        value={auctionItemBid}
                        onChange={auctionItemBidHandler}
                        min="0"
                        step="0.01"
                    />
                    {!auctionItemBidIsValid && <small className="text-danger">Bid price must be entered</small>}
                </div>
            </div>
            <button type='submit' className='btn btn-lg btn-info text-white btn-block'>BID ON MARKET AUCTION ITEM</button>
        </form>
    );
};

export default BidOnMarketItemForm;  