import { useContext } from 'react';

import MintNFTForm from './MintNFTForm';
import NFTCollection from './NFTCollection';
import NFTContext from '../../../provider/NFTProvider';
import Spinner from '../../layout/Spinner';
import logo from '../../../img/logo-collection.PNG'

const NFTMain = () => {
	const nftContext = useContext(NFTContext);

	return (
		<div className="container-fluid mt-2">
			<div className="row">
				<main role="main" className="col-lg-12 justify-content-center text-center">
					<div className="content mr-auto ml-auto">
						<img src={logo} alt="logo" width="500" height="140" className="mb-2" />
						{!nftContext.nftIsLoading && <MintNFTForm />}
						{nftContext.nftIsLoading && <Spinner />}
					</div>
				</main>
			</div>
			<hr />
			{!nftContext.nftIsLoading && <NFTCollection />}
			{nftContext.nftIsLoading && <Spinner />}
		</div>
	);
};

export default NFTMain;