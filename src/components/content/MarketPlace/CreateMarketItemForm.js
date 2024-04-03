import React, { useState, useContext } from 'react';

import Web3Context from '../../../providers/Web3Provider';
import MarketplaceContext from '../../../providers/MarketplaceProvider';
import { toWei } from '../../../utils/helper'

const CreateMarketItemForm = ({ tokenId }) => {
	const web3Context = useContext(Web3Context);
	const marketplaceContext = useContext(MarketplaceContext);

	const [marketTokenId, setEnteredMarketTokenId] = useState('');
	const [marketTokenIdIsValid, setMarketTokenIdIsValid] = useState(true);

	const [marketItemPrice, setEnteredMarketItemPrice] = useState('');
	const [marketItemPriceIsValid, setMarketItemPriceIsValid] = useState(true);

	useEffect(() => {
		if (tokenId) {
			setEnteredMarketTokenId(tokenId);
			setMarketTokenIdIsValid(true);
		}
	}, [tokenId]);

	const marketTokenIdHandler = (event) => {
		const value = event.target.value;
		if (value >= 0) {
			setEnteredMarketTokenId(value);
			setMarketTokenIdIsValid(true);
		} else {
			setMarketTokenIdIsValid(false);
		}
	};

	const marketItemPriceHandler = (event) => {
		const value = event.target.value;
		setEnteredMarketItemPrice(value);
		setMarketItemPriceIsValid(!!value);
	};

	const createMarketItemHandler = (event) => {
		event.preventDefault();

		const marketFormIsValid = marketTokenIdIsValid && marketItemPriceIsValid;

		const createMarketItem = async () => {
			try {
				const listingFee = marketplaceContext.listingFee;
				await marketplaceContext.contract.methods.createMarketItem(web3Context.nftContractAddress, marketTokenId, toWei(marketItemPrice))
					.send({ from: web3Context.account, value: listingFee })
					.on('transactionHash', (hash) => {
						marketplaceContext.setMktIsLoading(true);
					})
					.on('error', (e) => {
						window.alert('Something went wrong when creating market item');
						marketplaceContext.setMktIsLoading(false);
					});
				alert("Market item created successfully!");
				marketplaceContext.loadMarketItems();
			} catch (error) {
				console.error('Error creating market item:', error);
				alert("Failed to create market item.");
			}
		};

		marketFormIsValid && createMarketItem();
	};

	const marketTokenIdClass = marketTokenIdIsValid ? "form-control" : "form-control is-invalid";
	const marketItemPriceClass = marketItemPriceIsValid ? "form-control" : "form-control is-invalid";

	return (
		<form onSubmit={createMarketItemHandler}>
			<div className="row justify-content-center">
				<div className="col-md-2">
					<input
						type='number'
						className={`${marketTokenIdClass} mb-1`}
						placeholder='Token ID...'
						value={marketTokenId}
						onChange={marketTokenIdHandler}
						min="0"
						step="1"
					/>
					{!marketTokenIdIsValid && <small className="text-danger">Token ID greater than 0 must be entered</small>}
				</div>
				<div className="col-md-6">
					<input
						type='number'
						className={`${marketItemPriceClass} mb-1`}
						placeholder='Token price in ETH...'
						value={marketItemPrice}
						onChange={marketItemPriceHandler}
						min="0"
						step="0.01"
					/>
					{!marketItemPriceIsValid && <small className="text-danger">Price must be entered</small>}
				</div>
			</div>
			<button type='submit' className='btn btn-lg btn-info text-white btn-block'>CREATE MARKET ITEM</button>
		</form>
	);
};

export default CreateMarketItemForm;  