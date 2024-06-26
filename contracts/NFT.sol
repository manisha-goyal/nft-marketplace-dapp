// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage, IERC2981 {
    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;

    mapping(string => bool) tokenURIExists;

    mapping(uint256 => address) private nftCreators;

    mapping(uint256 => bool) public transferEligible;

    mapping(uint256 => uint256) public tokenRoyalties;

    address private marketplaceAddress;

    event TokenMinted(
        uint256 indexed tokenId,
        string tokenURI,
        address recipient,
        uint256 royalty,
        address marketplaceAddress
    );

    modifier onlyNFTOwner(uint256 tokenId) {
        require(msg.sender == ownerOf(tokenId), "Caller is not the NFT owner");
        _;
    }

    constructor(address _marketplaceAddress) ERC721("MyNFT", "MNFT") {
        marketplaceAddress = _marketplaceAddress;
    }

    function mintNFT(
        address recipient,
        string memory tokenURI,
        uint256 royalty
    ) public returns (uint256) {
        require(!tokenURIExists[tokenURI], 'The token URI is not unique');
        tokenIds.increment();
        uint256 newItemId = tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        nftCreators[newItemId] = recipient;
        tokenRoyalties[newItemId] = royalty;
        transferEligible[newItemId] = true;

        setApprovalForAll(marketplaceAddress, true);

        emit TokenMinted(
            newItemId,
            tokenURI,
            recipient,
            royalty,
            marketplaceAddress
        );
        return newItemId;
    }

    function mintMultipleNFTs(
        address[] memory recipients,
        string[] memory tokenURIs,
        uint256[] memory royalties
    ) public returns (uint256[] memory) {
        require(
            recipients.length == tokenURIs.length && tokenURIs.length == royalties.length,
            "Recipeints, URIs and royalties length mismatch"
        );

        for (uint i = 0; i < tokenURIs.length; i++) {
            require(!tokenURIExists[tokenURIs[i]], 'The token URIs are not unique');
        }

        uint256[] memory newItemId = new uint256[](tokenURIs.length);

        for (uint i = 0; i < tokenURIs.length; i++) {
            newItemId[i] = mintNFT(recipients[i], tokenURIs[i], royalties[i]);
        }

        return newItemId;
    }

    function enableTransfer(uint256 tokenId) public onlyNFTOwner(tokenId) {
        transferEligible[tokenId] = true;
    }

    function disableTransfer(uint256 tokenId) public onlyNFTOwner(tokenId) {
        transferEligible[tokenId] = false;
    }

    function isTransferEligible(
        uint256 tokenId
    ) external view returns (bool isEligible) {
        return transferEligible[tokenId];
    }

    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        uint256 royalty = tokenRoyalties[tokenId];
        return (nftCreators[tokenId], (salePrice * royalty) / 10000);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(IERC721, ERC721) {
        require(
            transferEligible[tokenId],
            "This token is not eligible for transfer"
        );
        super.transferFrom(from, to, tokenId);
    }

    function getMarketplaceAddress()
        external
        view
        returns (address marketplace)
    {
        return marketplaceAddress;
    }

    function getNFTCreator(uint256 tokenId) 
        external
        view
        returns (address creator)
    {
        return nftCreators[tokenId];
    }

    function getTotalSupply()
        external
        view
        returns (uint256 supply)
    {
        return tokenIds.current();
    }

}
