// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract NFTMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;
    Counters.Counter private _itemsRemoved;

    address payable owner;
    uint256 listingFee = 0.025 ether;

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

    event MarketSaleCreated(
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event BidPlaced(
        uint indexed itemId,
        address indexed bidder,
        uint256 bidAmount,
        uint256 auctionEndTime
    );

    event AuctionEnded(
        uint indexed itemId,
        address winner,
        uint256 winningBid,
        bool hadBids
    );

    function createMarketItem(address nftContract, uint256 tokenId, uint256 price) 
        public 
        payable 
        nonReentrant 
        returns (uint256)
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

        emit MarketItemCreated(itemId, nftContract, tokenId, payable(msg.sender), payable(address(0)), price, false, false);
        return itemId;
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

    function createAuctionItem(address nftContract, uint256 tokenId, uint256 minBid, uint256 auctionEndTime) 
        public 
        payable 
        nonReentrant 
    {
        require(minBid > 0, "Minimum bid must be greater than 0");
        require(msg.value == listingFee, "Please submit the listing fee");
        require(auctionEndTime > block.timestamp, "Auction end time must be in the future");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToAuctionItem[itemId] = AuctionItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            minBid,
            payable(address(0)),
            auctionEndTime,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit AuctionItemCreated(itemId, nftContract, tokenId, msg.sender, minBid, address(0), auctionEndTime, false);
    }

    function createMarketSale(address nftContract, uint256 itemId) 
        public 
        payable 
        nonReentrant 
    {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(msg.value == price, "Please submit the asking price to complete the purchase");

        (, uint256 royaltyAmount) = IERC2981(nftContract).royaltyInfo(tokenId, price);
        require(royaltyAmount <= price, "Royalty exceeds sale price");

        if (royaltyAmount > 0) {
            (bool royaltySuccess, ) = payable(idToMarketItem[itemId].seller).call{value: royaltyAmount}("");
            require(royaltySuccess, "Failed to send royalty");
        }

        uint256 sellerProceeds = price - royaltyAmount;

        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;

        (bool proceedsSuccess, ) = idToMarketItem[itemId].seller.call{value: sellerProceeds}("");
        require(proceedsSuccess, "Failed to send seller proceeds");
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        
        _itemsSold.increment();

        payable(owner).transfer(listingFee);

        emit MarketSaleCreated(
            itemId,
            nftContract,
            tokenId,
            idToMarketItem[itemId].seller,
            payable(msg.sender),
            sellerProceeds
        );
    }

    function bidOnAuction(uint256 itemId) 
        public 
        payable 
        nonReentrant 
    {
        AuctionItem storage auction = idToAuctionItem[itemId];
        require(block.timestamp < auction.auctionEndTime, "Auction has ended");
        require(msg.value > auction.highestBid, "There is already a higher bid");

        if (auction.highestBidder != address(0)) {
            auction.highestBidder.transfer(auction.highestBid);
        }

        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);

        emit BidPlaced(
            itemId,
            msg.sender,
            msg.value,
            auction.auctionEndTime
        );
    }

    function endAuction(uint256 itemId) 
        public 
        nonReentrant 
    {
        AuctionItem storage auction = idToAuctionItem[itemId];
        require(block.timestamp >= auction.auctionEndTime, "Auction not yet ended");
        require(!auction.ended, "Auction end has already been called");

        auction.ended = true;
        bool hadBids = auction.highestBidder != address(0);

        if (hadBids) {
            (address royaltyReceiver, uint256 royaltyAmount) = IERC2981(auction.nftContract).royaltyInfo(auction.tokenId, auction.highestBid);
            require(royaltyAmount <= auction.highestBid, "Royalty exceeds the highest bid");

            uint256 sellerProceeds = auction.highestBid - royaltyAmount;

            if (royaltyAmount > 0) {
                payable(royaltyReceiver).transfer(royaltyAmount);
            }

            auction.seller.transfer(sellerProceeds);
            IERC721(auction.nftContract).transferFrom(address(this), auction.highestBidder, auction.tokenId);
        } else {
            IERC721(auction.nftContract).transferFrom(address(this), auction.seller, auction.tokenId);
        }

        emit AuctionEnded(
            itemId,
            auction.highestBidder,
            auction.highestBid,
            hadBids
        );
    }


    function getAvailableMarketItems() 
        public 
        view 
        returns (MarketItem[] memory) 
    {
        uint256 itemsCount = _itemIds.current();
        uint256 soldItemsCount = _itemsSold.current();
        uint256 removedItemsCount = _itemsRemoved.current();
        uint256 availableItemsCount = itemsCount - soldItemsCount - removedItemsCount;
        
        MarketItem[] memory marketItems = new MarketItem[](availableItemsCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < itemsCount; i++) {
            MarketItem memory item = idToMarketItem[i + 1];
            if (item.owner != address(0)) 
                continue;
            marketItems[currentIndex] = item;
            currentIndex += 1;
        }

        return marketItems;
    }

    function getMarketItemById(uint256 itemId) 
        public 
        view 
        returns (MarketItem memory item) 
    {
        return idToMarketItem[itemId];
    }

    function getAuctionItemById(uint256 itemId) 
        public 
        view 
        returns (AuctionItem memory item) 
    {
        return idToAuctionItem[itemId];
    }

    function getMarketplaceOwner() 
        external 
        view 
        returns (address marketplaceOwner) 
    {
        return owner;
    }

    function getMarketplaceListingFee() 
        external 
        view 
        returns (uint256 fee) 
    {
        return listingFee;
    }
}
