// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract NFTMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    Counters.Counter private _itemIds; // Tracks the id of the last item (NFT) created
    Counters.Counter private _itemsSold; // Tracks the number of items sold
    Counters.Counter private _itemsRemoved; // Tracks the number of items removed

    address payable owner; // Owner of the marketplace
    uint256 listingFee = 0.025 ether; // Fee to list an NFT for sale or auction

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        bool removed;
    }

    struct AuctionItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        uint256 highestBid;
        address payable highestBidder;
        uint256 auctionEndTime;
        bool ended;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;
    mapping(uint256 => AuctionItem) private idToAuctionItem;

    // Events
    event MarketItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold,
        bool removed
    );

    event AuctionItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 highestBid,
        address highestBidder,
        uint256 auctionEndTime,
        bool ended
    );

    function createMarketItem(address nftContract, uint256 tokenId, uint256 price) 
        public 
        payable 
        nonReentrant 
    {
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingFee, "Please submit the listing fee");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(itemId, nftContract, tokenId, msg.sender, address(0), price, false, false);
    }

    function removeMarketItem(address nftContract, uint256 itemId) 
        public 
        payable 
        nonReentrant 
    {
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(tokenId > 0, "Market item has to exist");
        require(idToMarketItem[itemId].seller == msg.sender, "You are not the seller");

        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].removed = true;

        _itemsRemoved.increment();
    }

    function createAuctionItem(address nftContract, uint256 tokenId, uint256 minBid) 
        public 
        payable 
        nonReentrant 
    {
        require(minBid > 0, "Minimum bid must be greater than 0");
        require(msg.value == listingFee, "Please submit the listing fee");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToAuctionItem[itemId] = AuctionItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            minBid,
            payable(address(0)),
            block.timestamp + 86400, // Auction ends in 24 hours
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit AuctionItemCreated(itemId, nftContract, tokenId, msg.sender, minBid, address(0), block.timestamp + 86400, false);
    }

    function bidOnAuction(uint256 itemId) public payable nonReentrant {
        AuctionItem storage auction = idToAuctionItem[itemId];
        require(block.timestamp < auction.auctionEndTime, "Auction has ended");
        require(msg.value > auction.highestBid, "There is already a higher bid");

        if (auction.highestBidder != address(0)) {
            auction.highestBidder.transfer(auction.highestBid); // Refund the previous highest bidder
        }

        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);

        // No event emitted for simplicity, but you should consider adding one for tracking bids
    }

    function endAuction(uint256 itemId) public nonReentrant {
        AuctionItem storage auction = idToAuctionItem[itemId];
        require(block.timestamp >= auction.auctionEndTime, "Auction not yet ended");
        require(!auction.ended, "Auction end has already been called");

        auction.ended = true;
        if (auction.highestBidder != address(0)) {
            IERC721(auction.nftContract).transferFrom(address(this), auction.highestBidder, auction.tokenId);
            auction.seller.transfer(auction.highestBid); // Pay the seller
        } else {
            // Auction ended without bids; return NFT to seller
            IERC721(auction.nftContract).transferFrom(address(this), auction.seller, auction.tokenId);
        }

        // Consider emitting an event for auction end
    }

    function createMarketSale(address nftContract, uint256 itemId) public payable nonReentrant {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(msg.value == price, "Please submit the asking price to complete the purchase");

        idToMarketItem[itemId].seller.transfer(msg.value); // Transfer funds to seller
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId); // Transfer NFT to buyer
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();

        // Optionally, emit an event for the sale
    }

    // Additional functions such as withdrawListingFee, updateListingFee, etc., can be added for marketplace management
}
