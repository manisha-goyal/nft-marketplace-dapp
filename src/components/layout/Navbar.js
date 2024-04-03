import { useContext } from 'react';

import Web3Context from '../../providers/Web3Provider';
import web3 from '../../connection/web3';

const Navbar = () => {

	const web3Context = useContext(Web3Context);

	const connectWalletHandler = async () => {
		try {
			// Request account access
			await window.ethereum.request({ method: 'eth_requestAccounts' });
		} catch (error) {
			console.error(error);
		}

		// Load accounts
		web3Context.loadAccount(web3);
	};

	return (
		<nav className="navbar navbar-expand-sm navbar-light bg-white p-0">
			<ul className="navbar-nav ms-auto">
				<li className="nav-item">
					{web3Context.account &&
						<a
							className="nav-link small"
							href={`https://sepolia.etherscan.io/address/${web3Context.account}`}
							target="blank"
							rel="noopener noreferrer"
						>
							{web3Context.account}
						</a>}
					{!web3Context.account &&
						<button
							type="button"
							className="btn btn-info text-white"
							onClick={connectWalletHandler}
						>
							Connect your wallet
						</button>}
				</li>
			</ul>
		</nav>
	);
};

export default Navbar;