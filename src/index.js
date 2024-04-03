import ReactDOM from 'react-dom';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';

import Web3Provider from './providers/Web3Provider';
import NFTProvider from './providers/NFTProvider';
import MarketplaceProvider from './providers/MarketplaceProvider';
import App from './App';

ReactDOM.render(
  <Web3Provider>
    <NFTProvider>
      <MarketplaceProvider>
        <App />
      </MarketplaceProvider>
    </NFTProvider>
  </Web3Provider>, 
  document.getElementById('root')
);