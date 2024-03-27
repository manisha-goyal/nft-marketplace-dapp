// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, ERC721Enumerable, Ownable {
    uint256 private _currentTokenId = 0;
    mapping(uint256 => uint256) private _tokenRoyalties;
    bool public transfersEnabled = true;

    constructor() ERC721("MyNFT", "MNFT") {}

    function safeMint(address to, string memory uri, uint256 royaltyPercentage) public onlyOwner {
        require(royaltyPercentage <= 100, "MyNFT: Royalty percentage must not exceed 100.");
        _currentTokenId += 1;
        uint256 newTokenId = _currentTokenId;
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, uri);
        _setTokenRoyalty(newTokenId, royaltyPercentage);
    }

    function batchMint(address[] memory to, string[] memory uri, uint256[] memory royaltyPercentage) public onlyOwner {
        require(to.length == uri.length && uri.length == royaltyPercentage.length, "MyNFT: Arrays must have the same length");
        for (uint256 i = 0; i < to.length; i++) {
            safeMint(to[i], uri[i], royaltyPercentage[i]);
        }
    }

    // Override _beforeTokenTransfer to incorporate transfer restrictions
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
        require(transfersEnabled, "MyNFT: Transfers are currently disabled.");
    }

    // Override required by Solidity for ERC721Enumerable
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _setTokenRoyalty(uint256 tokenId, uint256 royaltyPercentage) internal {
        _tokenRoyalties[tokenId] = royaltyPercentage;
    }

    function tokenRoyalty(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "MyNFT: Query for nonexistent token");
        return _tokenRoyalties[tokenId];
    }

    // Function to toggle transferability (can be expanded with more complex logic)
    function toggleTransfers(bool _enabled) public onlyOwner {
        transfersEnabled = _enabled;
    }

    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount) {
        require(_exists(tokenId), "MyNFT: Query for nonexistent token");
        uint256 royalty = _tokenRoyalties[tokenId];
        return (owner(), (salePrice * royalty) / 100);
    }
}
