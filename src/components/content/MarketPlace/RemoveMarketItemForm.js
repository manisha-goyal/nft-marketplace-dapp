import React, { useState, useContext } from 'react';

import Web3Context from '../../../providers/Web3Provider';
import MarketplaceContext from '../../../providers/MarketplaceProvider';

const RemoveMarketItemForm = ({itemId}) => {
	const web3Context = useContext(Web3Context);
	const marketplaceContext = useContext(MarketplaceContext);

	const [marketItemId, setEnteredMarketItemId] = useState('');
	const [marketItemIdIsValid, setMarketItemIdIsValid] = useState(true);

	const marketItemIdHandler = (event) => {
		const value = event.target.value;
		if (value >= 0) {
			setEnteredMarketItemId(value);
			setMarketItemIdIsValid(true);
		} else {
			setMarketItemIdIsValid(false);
		}
	};

	useEffect(() => {
		if (itemId) {
			setEnteredMarketItemId(itemId);
			setMarketItemIdIsValid(true);
		}
	}, [itemId]);

	const removeMarketItemHandler = (event) => {
		event.preventDefault();

		const marketFormIsValid = marketItemIdIsValid;

		const removeMarketItem = async () => {
			try {
				await marketplaceContext.contract.methods.removeMarketItem(web3Context.nftContractAddress, marketItemId)
					.send({ from: web3Context.account })
					.on('transactionHash', (hash) => {
						marketplaceContext.setMktIsLoading(true);
					})
					.on('error', (e) => {
						window.alert('Something went wrong when removing market item');
						marketplaceContext.setMktIsLoading(false);
					});
				alert("Market item removing successfully!");
				marketplaceContext.loadMarketItems();
			} catch (error) {
				console.error('Error removing market item:', error);
				alert("Failed to removing market item.");
			}
		};

		marketFormIsValid && removeMarketItem();
	};

	const marketItemIdClass = marketItemIdIsValid ? "form-control" : "form-control is-invalid";

	return (
		<form onSubmit={removeMarketItemHandler}>
			<div className="row justify-content-center">
				<div className="col-md-2">
					<input
						type='number'
						className={`${marketItemIdClass} mb-1`}
						placeholder='Item ID...'
						value={marketItemId}
						onChange={marketItemIdHandler}
						min="0"
						step="1"
					/>
					{!marketItemIdIsValid && <small className="text-danger">Item ID greater than 0 must be entered</small>}
				</div>
			</div>
			<button type='submit' className='btn btn-lg btn-info text-white btn-block'>REMOVE MARKET ITEM</button>
		</form>
	);
};

export default RemoveMarketItemForm;  