// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping to keep track of token transfer eligibility
    mapping(uint256 => bool) public transferEligible;

    // Mapping for token royalties
    mapping(uint256 => uint) public tokenRoyalties;

    address private marketplaceAddress;

    event TokenMinted(uint256 indexed tokenId, string tokenURI, address marketplaceAddress);

    constructor(address _marketplaceAddress) ERC721("MyNFT", "MNFT") {
        marketplaceAddress = _marketplaceAddress;
    }

    // Minting function with royalty and transfer eligibility option
    function mintNFT(address recipient, string memory tokenURI, uint royalty)
        public
        onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        // Set royalty and transfer eligibility for the new token
        tokenRoyalties[newItemId] = royalty;
        transferEligible[newItemId] = true; // Tokens are transferable by default

        setApprovalForAll(marketplaceAddress, true);

        emit TokenMinted(newItemId, tokenURI, marketplaceAddress);
        return newItemId;
    }

    // Batch minting function
    function mintMultipleNFTs(address[] memory recipient, string[] memory tokenURIs, uint[] memory royalties)
        public
        onlyOwner
    {
        require(tokenURIs.length == royalties.length, "URIs and royalties length mismatch");

        for (uint i = 0; i < tokenURIs.length; i++) {
            mintNFT(recipient[i], tokenURIs[i], royalties[i]);
        }
    }

    // Function to enable transfer for a token
    function enableTransfer(uint256 tokenId) 
        public 
        onlyOwner 
    {
        transferEligible[tokenId] = true;
    }

    // Function to disable transfer for a token
    function disableTransfer(uint256 tokenId) 
        public 
        onlyOwner 
    {
        transferEligible[tokenId] = false;
    }

    // Override for ERC721URIStorage
    function _burn(uint256 tokenId) internal override(ERC721URIStorage, ERC721) {
        super._burn(tokenId);
    }

    // Override for ERC721URIStorage
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}