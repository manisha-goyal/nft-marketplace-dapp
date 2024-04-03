import React, { useContext } from 'react';

import MarketPlaceCollection from './MarketPlaceCollection';
import MarketplaceContext from '../../../providers/MarketplaceProvider';
import Spinner from '../../layout/Spinner';
import logo from '../../../img/logo-marketplace.png';

const MarketMain = () => {
    const marketplaceContext = useContext(MarketplaceContext);
    const isLoading = marketplaceContext.mktIsLoading;

    return (
        <div className="container-fluid mt-2">
            <div className="row">
                <main role="main" className="col-lg-12 justify-content-center text-center">
                    <div className="content mr-auto ml-auto">
                        <img src={logo} alt="Marketplace Logo" width="500" height="140" className="mb-2" />
                        {isLoading && <Spinner />}
                    </div>
                </main>
            </div>
            <hr />
            {!isLoading && <MarketPlaceCollection />}
        </div>
    );
};

export default MarketMain;
