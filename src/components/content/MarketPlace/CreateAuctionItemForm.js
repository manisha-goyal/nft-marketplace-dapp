import React, { useState, useEffect, useContext } from 'react';

import Web3Context from '../../../providers/Web3Context';
import MarketplaceContext from '../../../providers/MarketplaceContext';
import { toWei, convertDateToTimestamp } from '../../../utils/helper'

const CreateAuctionItemForm = (tokenId) => {
    const web3Context = useContext(Web3Context);
    const marketplaceContext = useContext(MarketplaceContext);

    const [auctionTokenId, setEnteredAuctionTokenId] = useState('');
    const [auctionTokenIdIsValid, setAuctionTokenIdIsValid] = useState(true);

    const [auctionItemMinBid, setEnteredAuctionItemMinBid] = useState('');
    const [auctionItemMinBidIsValid, setAuctionItemMinBidIsValid] = useState(true);

    const [auctionItemAuctionEnd, setEnteredAuctionItemAuctionEnd] = useState('');
    const [auctionItemAuctionEndIsValid, setAuctionItemAuctionEndIsValid] = useState(true);

    useEffect(() => {
        if (tokenId) {
            setEnteredAuctionTokenId(tokenId);
            setAuctionTokenIdIsValid(true);
        }
    }, [tokenId]);

    const auctionTokenIdHandler = (event) => {
        const value = event.target.value;
        if (value >= 0) {
			setEnteredAuctionTokenId(value);
			setAuctionTokenIdIsValid(true);
		} else {
			setAuctionTokenIdIsValid(false);
		}
    };

    const auctionItemMinBidHandler = (event) => {
        const value = event.target.value;
        setEnteredAuctionItemMinBid(value);
        setAuctionItemMinBidIsValid(!!value);
    };

    const auctionItemAuctionEndHandler = (event) => {
        const value = event.target.value;
        setEnteredAuctionItemAuctionEnd(value);
        setAuctionItemAuctionEndIsValid(!!value);
    };

    const createAuctionItemHandler = (event) => {
        event.preventDefault();

        const auctionFormIsValid = auctionTokenIdIsValid && auctionItemMinBidIsValid && auctionItemAuctionEndIsValid;

        const createAuctionItem = async () => {
            try {
                const listingFee = marketplaceContext.listingFee;
                await marketplaceContext.contract.methods.createAuctionItem(web3Context.nftContractAddress, auctionTokenId, toWei(auctionItemMinBid),
                    convertDateToTimestamp(auctionItemAuctionEnd))
                    .send({ from: web3Context.account, value: listingFee })
                    .on('transactionHash', (hash) => {
                        marketplaceContext.setMktIsLoading(true);
                    })
                    .on('error', (e) => {
                        window.alert('Something went wrong when creating market auction item');
                        marketplaceContext.setMktIsLoading(false);
                    });
                alert("Market auction item created successfully!");
                marketplaceContext.loadAuctionItems();
            } catch (error) {
                console.error('Error creating market auction item:', error);
                alert("Failed to create market auction item.");
            }
        };

        auctionFormIsValid && createAuctionItem();
    };

    const auctionTokenIdClass = auctionTokenIdIsValid ? "form-control" : "form-control is-invalid";
    const auctionItemMinBidClass = auctionItemMinBidIsValid ? "form-control" : "form-control is-invalid";
    const auctionItemAuctionEndClass = auctionItemAuctionEndIsValid ? "form-control" : "form-control is-invalid";

    return (
        <form onSubmit={createAuctionItemHandler}>
            <div className="row justify-content-center">
                <div className="col-md-2">
                    <input
                        type='number'
                        className={`${auctionTokenIdClass} mb-1`}
                        placeholder='Token ID...'
                        value={auctionTokenId}
                        onChange={auctionTokenIdHandler}
                        min="0"
						step="1"
                    />
                    {!auctionTokenIdIsValid && <small className="text-danger">Token ID greater than 0 must be entered</small>}
                </div>
                <div className="col-md-6">
                    <input
                        type='number'
                        className={`${auctionItemMinBidClass} mb-1`}
                        placeholder='Token price...'
                        value={auctionItemMinBid}
                        onChange={auctionItemMinBidHandler}
                        min="0"
						step="0.01"
                    />
                    {!auctionItemMinBidIsValid && <small className="text-danger">Price must be entered</small>}
                </div>
                <div className="col-md-6">
                    <input
                        type='text'
                        className={`${auctionItemAuctionEndClass} mb-1`}
                        placeholder='Auction end time...'
                        value={auctionItemMinBid}
                        onChange={auctionItemAuctionEndHandler}
                    />
                    {!auctionItemMinBidIsValid && <small className="text-danger">Auction end time must be entered</small>}
                </div>
            </div>
            <button type='submit' className='btn btn-lg btn-info text-white btn-block'>CREATE MARKET AUCTION ITEM</button>
        </form>
    );
};

export default CreateAuctionItemForm;  