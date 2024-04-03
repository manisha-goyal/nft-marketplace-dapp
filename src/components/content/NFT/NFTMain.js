import React, { useContext } from 'react';

import MintNFTForm from './MintNFTForm';
import NFTCollection from './NFTCollection';
import NFTContext from '../../../providers/NFTContext';
import Spinner from '../../layout/Spinner';
import logo from '../../../img/logo-collection.png'

const NFTMain = () => {
	const nftContext = useContext(NFTContext);
	const isLoading = nftContext.nftIsLoading;

	return (
		<div className="container-fluid mt-2">
			<div className="row">
				<main role="main" className="col-lg-12 justify-content-center text-center">
					<div className="content mr-auto ml-auto">
						<img src={logo} alt="NFT Collection Logo" width="250" height="140" className="mb-2" />
						{isLoading ? <Spinner /> : <MintNFTForm />}
					</div>
				</main>
			</div>
			<hr />
			{isLoading ? <Spinner /> : <NFTCollection />}
		</div>
	);
};

export default NFTMain;