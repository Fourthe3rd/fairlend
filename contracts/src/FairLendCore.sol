// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FairLendCore
 * @notice Undercollateralized lending protocol powered by FairScore reputation
 */
contract FairLendCore is ReentrancyGuard, Ownable {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    // ============ Constants ============
    
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant LIQUIDATION_THRESHOLD = 9500;
    uint256 public constant KEEPER_REWARD_BPS = 500;
    uint256 public constant INSURANCE_FEE_BPS = 2000;
    uint256 public constant VOUCH_REWARD_BPS = 1000;
    uint256 public constant MIN_LOAN_DURATION = 1 days;
    uint256 public constant MAX_LOAN_DURATION = 90 days;
    uint256 public constant MIN_FAIRSCORE = 200;
    uint256 public constant VOUCH_MIN_FAIRSCORE = 400;

    // ============ State Variables ============
    
    address public fairScaleSigner;
    IERC20 public lendingToken;
    IERC20 public collateralToken;
    address public priceOracle;
    
    uint256 public loanCounter;
    uint256 public seniorTrancheTVL;
    uint256 public juniorTrancheTVL;
    uint256 public insuranceFund;
    uint256 public totalBorrowed;
    uint256 public totalDefaulted;
    uint256 public totalInterestEarned;
    
    bool public paused;

    // ============ Structs ============
    
    struct CreditLimit {
        uint256 maxLoan;
        uint256 collateralRatio;
        uint256 interestRate;
        uint256 expiry;
        uint256 fairScore;
    }
    
    struct Loan {
        uint256 id;
        uint256 principal;
        uint256 collateral;
        uint256 interestRate;
        uint256 startTime;
        uint256 duration;
        bool active;
    }
    
    struct VouchPosition {
        address voucher;
        uint256 amount;
        bool active;
    }

    // ============ Mappings ============
    
    mapping(address => CreditLimit) public creditLimits;
    mapping(address => Loan) public loans;
    mapping(address => uint256) public seniorDeposits;
    mapping(address => uint256) public juniorDeposits;
    mapping(address => uint256) public voucherStakes;
    mapping(address => uint256) public voucherRewards;
    mapping(address => VouchPosition[]) public borrowerVouches;
    mapping(address => bool) public blacklisted;
    mapping(address => uint256) public successfulLoans;
    mapping(address => uint256) public defaultedLoans;

    // ============ Events ============
    
    event CreditLimitUpdated(address indexed user, uint256 maxLoan, uint256 collateralRatio, uint256 fairScore);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 principal, uint256 collateral, uint256 duration);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 principal, uint256 interest);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower, uint256 principalLost, uint256 collateralSeized);
    event SeniorDeposit(address indexed lender, uint256 amount);
    event SeniorWithdraw(address indexed lender, uint256 amount);
    event JuniorDeposit(address indexed lender, uint256 amount);
    event JuniorWithdraw(address indexed lender, uint256 amount);
    event VouchCreated(address indexed voucher, address indexed borrower, uint256 amount);
    event VouchWithdrawn(address indexed voucher, address indexed borrower, uint256 amount);
    event VouchSlashed(address indexed voucher, address indexed borrower, uint256 amount);
    event VouchRewardClaimed(address indexed voucher, uint256 amount);
    event InsuranceFundUpdated(uint256 newBalance);
    event UserBlacklisted(address indexed user);

    // ============ Modifiers ============
    
    modifier notPaused() {
        require(!paused, "Protocol paused");
        _;
    }
    
    modifier notBlacklisted(address user) {
        require(!blacklisted[user], "User blacklisted");
        _;
    }

    // ============ Constructor ============
    
    constructor(
        address _lendingToken,
        address _collateralToken,
        address _fairScaleSigner,
        address _priceOracle
    ) {
        lendingToken = IERC20(_lendingToken);
        collateralToken = IERC20(_collateralToken);
        fairScaleSigner = _fairScaleSigner;
        priceOracle = _priceOracle;
    }

    // ============ Credit Limit (Signed Attestation) ============
    
    function updateCreditLimit(
        uint256 maxLoan,
        uint256 collateralRatio,
        uint256 interestRate,
        uint256 expiry,
        uint256 fairScore,
        bytes calldata signature
    ) external notPaused notBlacklisted(msg.sender) {
        require(block.timestamp < expiry, "Attestation expired");
        require(fairScore >= MIN_FAIRSCORE, "FairScore too low");
        
        bytes32 messageHash = keccak256(abi.encodePacked(
            msg.sender,
            maxLoan,
            collateralRatio,
            interestRate,
            expiry,
            fairScore,
            block.chainid,
            address(this)
        ));
        
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);
        require(signer == fairScaleSigner, "Invalid signature");
        
        creditLimits[msg.sender] = CreditLimit({
            maxLoan: maxLoan,
            collateralRatio: collateralRatio,
            interestRate: interestRate,
            expiry: expiry,
            fairScore: fairScore
        });
        
        emit CreditLimitUpdated(msg.sender, maxLoan, collateralRatio, fairScore);
    }

    // ============ Lending Pools ============
    
    function depositSenior(uint256 amount) external nonReentrant notPaused {
        require(amount > 0, "Amount must be > 0");
        lendingToken.safeTransferFrom(msg.sender, address(this), amount);
        seniorDeposits[msg.sender] += amount;
        seniorTrancheTVL += amount;
        emit SeniorDeposit(msg.sender, amount);
    }
    
    function withdrawSenior(uint256 amount) external nonReentrant {
        require(seniorDeposits[msg.sender] >= amount, "Insufficient balance");
        require(getAvailableLiquidity() >= amount, "Insufficient liquidity");
        seniorDeposits[msg.sender] -= amount;
        seniorTrancheTVL -= amount;
        lendingToken.safeTransfer(msg.sender, amount);
        emit SeniorWithdraw(msg.sender, amount);
    }
    
    function depositJunior(uint256 amount) external nonReentrant notPaused {
        require(amount > 0, "Amount must be > 0");
        lendingToken.safeTransferFrom(msg.sender, address(this), amount);
        juniorDeposits[msg.sender] += amount;
        juniorTrancheTVL += amount;
        emit JuniorDeposit(msg.sender, amount);
    }
    
    function withdrawJunior(uint256 amount) external nonReentrant {
        require(juniorDeposits[msg.sender] >= amount, "Insufficient balance");
        require(getAvailableLiquidity() >= amount, "Insufficient liquidity");
        juniorDeposits[msg.sender] -= amount;
        juniorTrancheTVL -= amount;
        lendingToken.safeTransfer(msg.sender, amount);
        emit JuniorWithdraw(msg.sender, amount);
    }

    // ============ Vouching ============
    
    function vouchFor(address borrower, uint256 amount) external nonReentrant notPaused notBlacklisted(borrower) {
        require(borrower != msg.sender, "Cannot vouch for self");
        require(amount > 0, "Amount must be > 0");
        require(creditLimits[msg.sender].fairScore >= VOUCH_MIN_FAIRSCORE, "FairScore too low to vouch");
        
        lendingToken.safeTransferFrom(msg.sender, address(this), amount);
        voucherStakes[msg.sender] += amount;
        
        borrowerVouches[borrower].push(VouchPosition({
            voucher: msg.sender,
            amount: amount,
            active: true
        }));
        
        emit VouchCreated(msg.sender, borrower, amount);
    }
    
    function withdrawVouch(address borrower, uint256 vouchIndex) external nonReentrant {
        require(!loans[borrower].active, "Borrower has active loan");
        VouchPosition storage position = borrowerVouches[borrower][vouchIndex];
        require(position.voucher == msg.sender, "Not your vouch");
        require(position.active, "Vouch not active");
        
        uint256 amount = position.amount;
        position.active = false;
        position.amount = 0;
        voucherStakes[msg.sender] -= amount;
        
        lendingToken.safeTransfer(msg.sender, amount);
        emit VouchWithdrawn(msg.sender, borrower, amount);
    }
    
    function claimVouchRewards() external nonReentrant {
        uint256 rewards = voucherRewards[msg.sender];
        require(rewards > 0, "No rewards to claim");
        voucherRewards[msg.sender] = 0;
        lendingToken.safeTransfer(msg.sender, rewards);
        emit VouchRewardClaimed(msg.sender, rewards);
    }

    // ============ Borrowing ============
    
    function borrow(uint256 amount, uint256 duration) external nonReentrant notPaused notBlacklisted(msg.sender) {
        CreditLimit memory limit = creditLimits[msg.sender];
        
        require(block.timestamp < limit.expiry, "Credit limit expired");
        require(amount > 0 && amount <= limit.maxLoan, "Invalid loan amount");
        require(!loans[msg.sender].active, "Existing loan active");
        require(duration >= MIN_LOAN_DURATION && duration <= MAX_LOAN_DURATION, "Invalid duration");
        require(getAvailableLiquidity() >= amount, "Insufficient liquidity");
        
        uint256 collateralRequired = (amount * limit.collateralRatio) / BASIS_POINTS;
        collateralToken.safeTransferFrom(msg.sender, address(this), collateralRequired);
        
        loanCounter++;
        loans[msg.sender] = Loan({
            id: loanCounter,
            principal: amount,
            collateral: collateralRequired,
            interestRate: limit.interestRate,
            startTime: block.timestamp,
            duration: duration,
            active: true
        });
        
        totalBorrowed += amount;
        lendingToken.safeTransfer(msg.sender, amount);
        
        emit LoanCreated(loanCounter, msg.sender, amount, collateralRequired, duration);
    }
    
    function repay() external nonReentrant {
        Loan storage loan = loans[msg.sender];
        require(loan.active, "No active loan");
        
        uint256 interest = calculateInterest(msg.sender);
        uint256 totalOwed = loan.principal + interest;
        
        lendingToken.safeTransferFrom(msg.sender, address(this), totalOwed);
        collateralToken.safeTransfer(msg.sender, loan.collateral);
        
        uint256 insuranceCut = (interest * INSURANCE_FEE_BPS) / BASIS_POINTS;
        insuranceFund += insuranceCut;
        
        uint256 vouchReward = (interest * VOUCH_REWARD_BPS) / BASIS_POINTS;
        _distributeVouchRewards(msg.sender, vouchReward);
        
        totalInterestEarned += interest;
        totalBorrowed -= loan.principal;
        successfulLoans[msg.sender]++;
        loan.active = false;
        
        emit LoanRepaid(loan.id, msg.sender, loan.principal, interest);
        emit InsuranceFundUpdated(insuranceFund);
    }
    
    function _distributeVouchRewards(address borrower, uint256 totalReward) internal {
        VouchPosition[] storage positions = borrowerVouches[borrower];
        uint256 totalVouched = getTotalVouched(borrower);
        if (totalVouched == 0) return;
        
        for (uint256 i = 0; i < positions.length; i++) {
            if (positions[i].active && positions[i].amount > 0) {
                uint256 reward = (totalReward * positions[i].amount) / totalVouched;
                voucherRewards[positions[i].voucher] += reward;
            }
        }
    }

    // ============ Liquidation ============
    
    function liquidate(address borrower) external nonReentrant {
        Loan storage loan = loans[borrower];
        require(loan.active, "No active loan");
        
        bool isOverdue = block.timestamp > loan.startTime + loan.duration;
        bool isUndercollateralized = getHealthFactor(borrower) < LIQUIDATION_THRESHOLD;
        require(isOverdue || isUndercollateralized, "Loan is healthy");
        
        uint256 keeperReward = (loan.collateral * KEEPER_REWARD_BPS) / BASIS_POINTS;
        uint256 totalOwed = loan.principal + calculateInterest(borrower);
        uint256 collateralValue = getCollateralValue(loan.collateral);
        
        uint256 shortfall = 0;
        if (collateralValue < totalOwed) {
            shortfall = totalOwed - collateralValue;
        }
        
        if (shortfall > 0) {
            shortfall = _slashVouchers(borrower, shortfall);
        }
        if (shortfall > 0 && insuranceFund >= shortfall) {
            insuranceFund -= shortfall;
            shortfall = 0;
        }
        if (shortfall > 0 && juniorTrancheTVL > 0) {
            uint256 juniorLoss = shortfall > juniorTrancheTVL ? juniorTrancheTVL : shortfall;
            juniorTrancheTVL -= juniorLoss;
        }
        
        collateralToken.safeTransfer(msg.sender, keeperReward);
        
        totalBorrowed -= loan.principal;
        totalDefaulted += loan.principal;
        defaultedLoans[borrower]++;
        loan.active = false;
        blacklisted[borrower] = true;
        
        emit LoanDefaulted(loan.id, borrower, loan.principal, loan.collateral);
        emit UserBlacklisted(borrower);
    }
    
    function _slashVouchers(address borrower, uint256 amount) internal returns (uint256) {
        VouchPosition[] storage positions = borrowerVouches[borrower];
        uint256 remaining = amount;
        
        for (uint256 i = 0; i < positions.length && remaining > 0; i++) {
            if (positions[i].active && positions[i].amount > 0) {
                uint256 slashAmount = remaining > positions[i].amount ? positions[i].amount : remaining;
                positions[i].amount -= slashAmount;
                voucherStakes[positions[i].voucher] -= slashAmount;
                remaining -= slashAmount;
                emit VouchSlashed(positions[i].voucher, borrower, slashAmount);
            }
        }
        return remaining;
    }

    // ============ View Functions ============
    
    function calculateInterest(address borrower) public view returns (uint256) {
        Loan memory loan = loans[borrower];
        if (!loan.active) return 0;
        uint256 elapsed = block.timestamp - loan.startTime;
        return (loan.principal * loan.interestRate * elapsed) / (365 days * BASIS_POINTS);
    }
    
    function getHealthFactor(address borrower) public view returns (uint256) {
        Loan memory loan = loans[borrower];
        if (!loan.active || loan.principal == 0) return type(uint256).max;
        uint256 collateralValue = getCollateralValue(loan.collateral);
        uint256 totalOwed = loan.principal + calculateInterest(borrower);
        return (collateralValue * BASIS_POINTS) / totalOwed;
    }
    
    function getCollateralValue(uint256 amount) public pure returns (uint256) {
        return (amount * 2000 * 1e6) / 1e18;
    }
    
    function getAvailableLiquidity() public view returns (uint256) {
        uint256 balance = lendingToken.balanceOf(address(this));
        uint256 reserved = insuranceFund;
        return balance > reserved ? balance - reserved : 0;
    }
    
    function getTotalVouched(address borrower) public view returns (uint256) {
        VouchPosition[] memory positions = borrowerVouches[borrower];
        uint256 total = 0;
        for (uint256 i = 0; i < positions.length; i++) {
            if (positions[i].active) total += positions[i].amount;
        }
        return total;
    }
    
    function getProtocolStats() external view returns (
        uint256, uint256, uint256, uint256, uint256, uint256
    ) {
        return (seniorTrancheTVL, juniorTrancheTVL, totalBorrowed, totalDefaulted, insuranceFund, loanCounter);
    }

    // ============ Admin ============
    
    function setPaused(bool _paused) external onlyOwner { paused = _paused; }
    function setFairScaleSigner(address _signer) external onlyOwner { fairScaleSigner = _signer; }
}
