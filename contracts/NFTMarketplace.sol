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
        require(idToMarketItem[itemId].sold == false, "Item already sold");
        require(msg.value == price, "Please submit the asking price to complete the purchase");

        (address royaltyReceiver, uint256 royaltyAmount) = IERC2981(nftContract).royaltyInfo(tokenId, price);
        require(royaltyAmount <= price, "Royalty exceeds sale price");

        if (royaltyAmount > 0) {
            (bool royaltySuccess, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
            require(royaltySuccess, "Failed to send royalty");
        }

        uint256 sellerProceeds = price - royaltyAmount;

        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;

        (bool proceedsSuccess, ) = idToMarketItem[itemId].seller.call{value: sellerProceeds}("");
        require(proceedsSuccess, "Failed to send seller proceeds");
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        
        (bool listingFeeSuccess, ) = payable(owner).call{value: listingFee}("");
        require(listingFeeSuccess, "Failed to send listing fee");

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
            (bool returnBidSuccess, ) = auction.highestBidder.call{value: auction.highestBid}("");
            require(returnBidSuccess, "Failed to return previous highest bidder proceeds");
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
        require(!auction.ended, "Auction end has already been called");

        auction.ended = true;
        bool hadBids = auction.highestBidder != address(0);

        if (hadBids) {
            (address royaltyReceiver, uint256 royaltyAmount) = IERC2981(auction.nftContract).royaltyInfo(auction.tokenId, auction.highestBid);
            require(royaltyAmount <= auction.highestBid, "Royalty exceeds the highest bid");

            uint256 sellerProceeds = auction.highestBid - royaltyAmount;
            
            if (royaltyAmount > 0) {
                (bool royaltySuccess, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
                require(royaltySuccess, "Failed to send royalty");
            }

            (bool proceedsSuccess, ) = auction.seller.call{value: sellerProceeds}("");
            require(proceedsSuccess, "Failed to send seller proceeds");
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
        returns (uint256[] memory) 
    {
        uint256 itemsCount = _itemIds.current();
        uint256 availableItemsCount = 0;
        for (uint256 i = 0; i < itemsCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0) && !idToMarketItem[i + 1].sold && !idToMarketItem[i + 1].removed) {
                availableItemsCount += 1;
            }
        }
        
        uint256[] memory availableItemIds = new uint256[](availableItemsCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < itemsCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0) && !idToMarketItem[i + 1].sold && !idToMarketItem[i + 1].removed) {
                availableItemIds[currentIndex] = i + 1; // Store the itemId
                currentIndex += 1;
            }
        }

        return availableItemIds;
    }

    function getAvailableAuctionItems() 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256 itemCount = _itemIds.current();
        uint256 auctionItemCount = 0;
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToAuctionItem[i + 1].auctionEndTime > 0) {
                auctionItemCount++;
            }
        }

        uint256[] memory itemIds = new uint256[](auctionItemCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToAuctionItem[i + 1].auctionEndTime > 0) {
                itemIds[currentIndex] = i + 1;
                currentIndex += 1;
            }
        }

        return itemIds;
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
