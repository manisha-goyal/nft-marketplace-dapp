// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721URIStorage, IERC2981, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => bool) public transferEligible;

    mapping(uint256 => uint256) public tokenRoyalties;

    address private marketplaceAddress;

    event TokenMinted(uint256 indexed tokenId, string tokenURI, address recipient, uint256 royalty, address marketplaceAddress);

    constructor(address _marketplaceAddress) ERC721("MyNFT", "MNFT") {
        marketplaceAddress = _marketplaceAddress;
    }

    function mintNFT(address recipient, string memory tokenURI, uint256 royalty)
        public
        onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        tokenRoyalties[newItemId] = royalty;
        transferEligible[newItemId] = true;

        setApprovalForAll(marketplaceAddress, true);

        emit TokenMinted(newItemId, tokenURI, recipient, royalty, marketplaceAddress);
        return newItemId;
    }

    function mintMultipleNFTs(address[] memory recipients, string[] memory tokenURIs, uint256[] memory royalties)
        public
        onlyOwner
    {
        require(tokenURIs.length == royalties.length, "URIs and royalties length mismatch");

        for (uint i = 0; i < tokenURIs.length; i++) {
            mintNFT(recipients[i], tokenURIs[i], royalties[i]);
        }
    }

    function enableTransfer(uint256 tokenId) 
        public 
        onlyOwner 
    {
        transferEligible[tokenId] = true;
    }

    function disableTransfer(uint256 tokenId) 
        public 
        onlyOwner 
    {
        transferEligible[tokenId] = false;
    }

    function isTransferEligible(uint256 tokenId)
        external
        view
        returns(bool isEligible) {
        return transferEligible[tokenId];
    }

    function updateTokenRoyalty(uint256 tokenId, uint256 royalty) 
        public 
        onlyOwner
    {
        require(_exists(tokenId), "Nonexistent token");
        tokenRoyalties[tokenId] = royalty;
    }

    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        external 
        view 
        override 
        returns (address receiver, uint256 royaltyAmount) 
    {
        uint256 royalty = tokenRoyalties[tokenId];
        return (ownerOf(tokenId), (salePrice * royalty) / 10000);
    }

    function transferFrom(address from, address to, uint256 tokenId) 
        public 
        override(IERC721, ERC721)
    {
        require(transferEligible[tokenId], "This token is not eligible for transfer");
        super.transferFrom(from, to, tokenId);
    }

    function getMarketplaceAddress() 
        external 
        view 
        returns (address marketplace) 
    {
        return marketplaceAddress;
    }
}