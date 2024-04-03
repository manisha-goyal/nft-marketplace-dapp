import { useState, useContext } from 'react';

import Web3Context from '../../../providers/Web3Provider';
import NFTContext from '../../../providers/NFTProvider';

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

const MintNFTForm = () => {
	const [nftName, setEnteredName] = useState('');
	const [nameIsValid, setDescriptionIsValid] = useState(true);

	const [nftDescription, setEnteredDescription] = useState('');
	const [descriptionIsValid, setNameIsValid] = useState(true);

	const [nftRoyalty, setEnteredRoyalty] = useState('');
	const [royaltyIsValid, setRoyaltyIsValid] = useState(true);

	const [capturedFileBuffer, setCapturedFileBuffer] = useState(null);
	const [fileIsValid, setFileIsValid] = useState(true);

	const web3Context = useContext(Web3Context);
	const nftContext = useContext(NFTContext);

	const nftNameHandler = (event) => {
		const value = event.target.value;
		setEnteredName(value);
		setNameIsValid(!!value);
	};

	const nftDescriptionHandler = (event) => {
		const value = event.target.value;
		setEnteredDescription(value);
		setDescriptionIsValid(!!value);
	};

	const nftRoyaltyHandler = (event) => {
		const royaltyValue = event.target.value;
		if (royaltyValue >= 0 && royaltyValue <= 100) {
			setEnteredRoyalty(royaltyValue);
			setRoyaltyIsValid(true);
		} else {
			setRoyaltyIsValid(false);
		}
	};

	const captureFile = (event) => {
		event.preventDefault();
		const file = event.target.files[0];
		if (file) {
			const reader = new window.FileReader();
			reader.readAsArrayBuffer(file);
			reader.onloadend = () => {
				setCapturedFileBuffer(Buffer(reader.result));
				setFileIsValid(true);
			};
		} else {
			setFileIsValid(false);
		}
	};

	const submissionHandler = (event) => {
		event.preventDefault();

		const formIsValid = nameIsValid && descriptionIsValid && royaltyIsValid && fileIsValid;

		// Upload file to IPFS and push to the blockchain
		const mintNFT = async () => {
			// Add file to the IPFS
			const fileAdded = await ipfs.add(capturedFileBuffer);
			if (!fileAdded) {
				console.error('Something went wrong when updloading the file');
				return;
			}

			const metadata = {
				title: "Asset Metadata",
				type: "object",
				properties: {
					name: {
						type: "string",
						description: nftName
					},
					description: {
						type: "string",
						description: nftDescription
					},
					royalty: {
						type: "number",
						description: `${nftRoyalty}%`
					},
					image: {
						type: "string",
						description: fileAdded.path
					}
				}
			};

			try {
				const metadataAdded = await ipfs.add(JSON.stringify(metadata));
				if (!metadataAdded) {
					console.error('Something went wrong when updloading the file');
					return;
				}

				const royaltyInBasisPoints = nftRoyalty * 100;
				nftContext.contract.methods.mintNFT(web3Context.account, metadataAdded.path, royaltyInBasisPoints)
					.send({ from: web3Context.account })
					.on('transactionHash', (hash) => {
						nftContext.setNftIsLoading(true);
					})
					.on('error', (e) => {
						window.alert('Something went wrong when pushing to the blockchain');
						nftContext.setNftIsLoading(false);
					})
				nftContext.getTotalSupply();
				nftContext.getNFTCollection();
			} catch (error) {
				console.error('Error minting NFT:', error);
				alert("Failed to mint NFT.");
			}
		};

		formIsValid && mintNFT();
	};

	const nameClass = nameIsValid ? "form-control" : "form-control is-invalid";
	const descriptionClass = descriptionIsValid ? "form-control" : "form-control is-invalid";
	const royaltyClass = royaltyIsValid ? "form-control" : "form-control is-invalid";
	const fileClass = fileIsValid ? "form-control" : "form-control is-invalid";

	return (
		<form onSubmit={submissionHandler}>
			<div className="row justify-content-center">
				<div className="col-md-2">
					<input
						type='text'
						className={`${nameClass} mb-1`}
						placeholder='Name...'
						value={nftName}
						onChange={nftNameHandler}
					/>
					{!nameIsValid && <small className="text-danger">Name must be entered</small>}
				</div>
				<div className="col-md-6">
					<input
						type='text'
						className={`${descriptionClass} mb-1`}
						placeholder='Description...'
						value={nftDescription}
						onChange={nftDescriptionHandler}
					/>
					{!descriptionIsValid && <small className="text-danger">Description must be entered</small>}
				</div>
				<div className="col-md-6">
					<input
						type='text'
						className={`${royaltyClass} mb-1`}
						placeholder='Royalty as a percentage (0-100)...'
						value={nftRoyalty}
						onChange={nftRoyaltyHandler}
					/>
					{!royaltyIsValid && <small className="text-danger">Royalty must be between 0% and 100%.</small>}
				</div>
				<div className="col-md-2">
					<input
						type='file'
						className={`${fileClass} mb-1`}
						onChange={captureFile}
					/>
					{!fileIsValid && <small className="text-danger">File must be entered</small>}
				</div>
			</div>
			<button type='submit' className='btn btn-lg btn-info text-white btn-block'>MINT NFT</button>
		</form>
	);
};

export default MintNFTForm;