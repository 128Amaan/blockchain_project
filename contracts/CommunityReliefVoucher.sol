// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Community Relief Voucher
/// @notice A transparent, one-time voucher register for community aid programs.
contract CommunityReliefVoucher {
    address public immutable owner;
    uint256 public nextVoucherId = 1;

    struct Household {
        string name;
        bool registered;
        uint256 redeemedCount;
    }

    struct Voucher {
        uint256 id;
        address recipient;
        uint256 amount;
        string purpose;
        uint256 issuedAt;
        uint256 expiresAt;
        bool redeemed;
    }

    mapping(address => Household) public households;
    mapping(address => bool) public issuers;
    mapping(uint256 => Voucher) private vouchers;
    mapping(address => uint256[]) private recipientVoucherIds;

    event HouseholdRegistered(address indexed household, string name);
    event IssuerUpdated(address indexed issuer, bool authorized);
    event VoucherIssued(uint256 indexed voucherId, address indexed recipient, uint256 amount, uint256 expiresAt);
    event VoucherRedeemed(uint256 indexed voucherId, address indexed recipient, uint256 redeemedAt);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only program owner can do this");
        _;
    }

    modifier onlyIssuer() {
        require(issuers[msg.sender], "Only authorized issuer can do this");
        _;
    }

    constructor() {
        owner = msg.sender;
        issuers[msg.sender] = true;
        emit IssuerUpdated(msg.sender, true);
    }

    function registerHousehold(address household, string calldata name) external onlyOwner {
        require(household != address(0), "Household address cannot be zero");
        require(bytes(name).length >= 2 && bytes(name).length <= 80, "Name must be 2-80 characters");
        require(!households[household].registered, "Household already registered");
        households[household] = Household({name: name, registered: true, redeemedCount: 0});
        emit HouseholdRegistered(household, name);
    }

    function setIssuer(address issuer, bool authorized) external onlyOwner {
        require(issuer != address(0), "Issuer address cannot be zero");
        issuers[issuer] = authorized;
        emit IssuerUpdated(issuer, authorized);
    }

    function issueVoucher(
        address recipient,
        uint256 amount,
        string calldata purpose,
        uint256 expiresAt
    ) external onlyIssuer returns (uint256 voucherId) {
        require(households[recipient].registered, "Recipient is not registered");
        require(amount > 0 && amount <= 1000000, "Amount must be between 1 and 1000000");
        require(bytes(purpose).length > 0 && bytes(purpose).length <= 120, "Purpose must be 1-120 characters");
        require(expiresAt > block.timestamp, "Expiry must be in the future");

        voucherId = nextVoucherId++;
        vouchers[voucherId] = Voucher({
            id: voucherId,
            recipient: recipient,
            amount: amount,
            purpose: purpose,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            redeemed: false
        });
        recipientVoucherIds[recipient].push(voucherId);
        emit VoucherIssued(voucherId, recipient, amount, expiresAt);
    }

    function redeemVoucher(uint256 voucherId) external {
        Voucher storage voucher = vouchers[voucherId];
        require(voucher.id != 0, "Voucher does not exist");
        require(msg.sender == voucher.recipient, "Only voucher recipient can redeem");
        require(!voucher.redeemed, "Voucher already redeemed");
        require(block.timestamp <= voucher.expiresAt, "Voucher has expired");
        voucher.redeemed = true;
        households[msg.sender].redeemedCount += 1;
        emit VoucherRedeemed(voucherId, msg.sender, block.timestamp);
    }

    function getVoucher(uint256 voucherId) external view returns (Voucher memory) {
        require(vouchers[voucherId].id != 0, "Voucher does not exist");
        return vouchers[voucherId];
    }

    function getMyVoucherIds() external view returns (uint256[] memory) {
        return recipientVoucherIds[msg.sender];
    }
}
