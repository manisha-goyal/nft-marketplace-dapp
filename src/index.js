import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';

import Web3Provider from './providers/Web3Provider';
import NFTProvider from './providers/NFTProvider';
import MarketplaceProvider from './providers/MarketplaceProvider';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
	<Web3Provider>
		<NFTProvider>
			<MarketplaceProvider>
				<App />
			</MarketplaceProvider>
		</NFTProvider>
	</Web3Provider>,
);