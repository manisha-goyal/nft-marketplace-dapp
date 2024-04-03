import React, { useState, useEffect, useContext } from 'react';

import Web3Context from '../../../providers/Web3Provider';
import MarketplaceContext from '../../../providers/MarketplaceProvider';

const EndMarketAuctionForm = ({itemId}) => {
	const web3Context = useContext(Web3Context);
	const marketplaceContext = useContext(MarketplaceContext);

	const [auctionItemId, setEnteredAuctionItemId] = useState('');
	const [auctionItemIdIsValid, setAuctionItemIdIsValid] = useState(true);

	const auctionItemIdHandler = (event) => {
		const value = event.target.value;
		if (value >= 0) {
			setEnteredAuctionItemId(value);
			setAuctionItemIdIsValid(true);
		} else {
			setAuctionItemIdIsValid(false);
		}
	};

	useEffect(() => {
		if (itemId) {
			setEnteredAuctionItemId(itemId);
			setAuctionItemIdIsValid(true);
		}
	}, [itemId]);

	const endMarketAuctionHandler = (event) => {
		event.preventDefault();

		const formIsValid = auctionItemIdIsValid;

		const endMarketAuction = async () => {
			try {
				await marketplaceContext.contract.methods.endAuction(web3Context.nftContractAddress, auctionItemId)
					.send({ from: web3Context.marketplaceContractAddress })
					.on('transactionHash', (hash) => {
						marketplaceContext.setMktIsLoading(true);
					})
					.on('error', (e) => {
						window.alert('Something went wrong when ending auction on market item');
						marketplaceContext.setMktIsLoading(false);
					});
				alert("Auction ended on market item successfully!");
				marketplaceContext.loadAuctionItems();
			} catch (error) {
				console.error('Error ending auction on market item:', error);
				alert("Failed to end auction on market item.");
			}
		};

		formIsValid && endMarketAuction();
	};

	const auctionItemIdClass = auctionItemIdIsValid ? "form-control" : "form-control is-invalid";

	return (
		<form onSubmit={endMarketAuctionHandler}>
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
			</div>
			<button type='submit' className='btn btn-lg btn-info text-white btn-block'>END MARKET AUCTION</button>
		</form>
	);
};

export default EndMarketAuctionForm;  