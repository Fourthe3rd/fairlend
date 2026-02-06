// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/FairLendCore.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 for testing
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    function decimals() public pure override returns (uint8) {
        return 6; // USDC decimals
    }
}

contract MockWETH is ERC20 {
    constructor() ERC20("Wrapped ETH", "WETH") {}
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract FairLendCoreTest is Test {
    FairLendCore public fairLend;
    MockERC20 public usdc;
    MockWETH public weth;
    
    address public owner = address(1);
    address public signer;
    uint256 public signerPrivateKey = 0xA11CE;
    address public borrower = address(3);
    address public lender = address(4);
    address public voucher = address(5);
    
    uint256 constant USDC_DECIMALS = 6;
    uint256 constant WETH_DECIMALS = 18;
    
    function setUp() public {
        signer = vm.addr(signerPrivateKey);
        
        // Deploy mock tokens
        usdc = new MockERC20("USD Coin", "USDC");
        weth = new MockWETH();
        
        // Deploy FairLend
        vm.prank(owner);
        fairLend = new FairLendCore(
            address(usdc),
            address(weth),
            signer,
            address(0) // Mock oracle
        );
        
        // Setup initial balances
        usdc.mint(lender, 100_000 * 10**USDC_DECIMALS);
        usdc.mint(borrower, 10_000 * 10**USDC_DECIMALS);
        usdc.mint(voucher, 10_000 * 10**USDC_DECIMALS);
        weth.mint(borrower, 100 * 10**WETH_DECIMALS);
        
        // Approvals
        vm.prank(lender);
        usdc.approve(address(fairLend), type(uint256).max);
        
        vm.prank(borrower);
        usdc.approve(address(fairLend), type(uint256).max);
        
        vm.prank(borrower);
        weth.approve(address(fairLend), type(uint256).max);
        
        vm.prank(voucher);
        usdc.approve(address(fairLend), type(uint256).max);
    }
    
    // ============ Helper Functions ============
    
    function _createAttestation(
        address user,
        uint256 maxLoan,
        uint256 collateralRatio,
        uint256 interestRate,
        uint256 expiry,
        uint256 fairScore
    ) internal view returns (bytes memory) {
        bytes32 messageHash = keccak256(abi.encodePacked(
            user,
            maxLoan,
            collateralRatio,
            interestRate,
            expiry,
            fairScore,
            block.chainid,
            address(fairLend)
        ));
        
        bytes32 ethSignedHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            messageHash
        ));
        
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, ethSignedHash);
        return abi.encodePacked(r, s, v);
    }
    
    function _setupCreditLimit(
        address user,
        uint256 fairScore
    ) internal {
        uint256 maxLoan;
        uint256 collateralRatio;
        uint256 interestRate;
        
        if (fairScore >= 800) {
            maxLoan = 50_000 * 10**USDC_DECIMALS;
            collateralRatio = 10000;
            interestRate = 800;
        } else if (fairScore >= 650) {
            maxLoan = 25_000 * 10**USDC_DECIMALS;
            collateralRatio = 12000;
            interestRate = 1000;
        } else if (fairScore >= 500) {
            maxLoan = 10_000 * 10**USDC_DECIMALS;
            collateralRatio = 13500;
            interestRate = 1200;
        } else {
            maxLoan = 5_000 * 10**USDC_DECIMALS;
            collateralRatio = 15000;
            interestRate = 1400;
        }
        
        uint256 expiry = block.timestamp + 1 days;
        
        bytes memory signature = _createAttestation(
            user, maxLoan, collateralRatio, interestRate, expiry, fairScore
        );
        
        vm.prank(user);
        fairLend.updateCreditLimit(
            maxLoan, collateralRatio, interestRate, expiry, fairScore, signature
        );
    }
    
    // ============ Credit Limit Tests ============
    
    function testUpdateCreditLimit() public {
        uint256 maxLoan = 10_000 * 10**USDC_DECIMALS;
        uint256 collateralRatio = 13500;
        uint256 interestRate = 1200;
        uint256 expiry = block.timestamp + 1 days;
        uint256 fairScore = 550;
        
        bytes memory signature = _createAttestation(
            borrower, maxLoan, collateralRatio, interestRate, expiry, fairScore
        );
        
        vm.prank(borrower);
        fairLend.updateCreditLimit(
            maxLoan, collateralRatio, interestRate, expiry, fairScore, signature
        );
        
        (uint256 storedMaxLoan, uint256 storedRatio, , , uint256 storedScore) = 
            fairLend.creditLimits(borrower);
        
        assertEq(storedMaxLoan, maxLoan);
        assertEq(storedRatio, collateralRatio);
        assertEq(storedScore, fairScore);
    }
    
    function testRejectExpiredAttestation() public {
        uint256 expiry = block.timestamp - 1; // Expired
        
        bytes memory signature = _createAttestation(
            borrower, 10_000e6, 13500, 1200, expiry, 550
        );
        
        vm.prank(borrower);
        vm.expectRevert("Attestation expired");
        fairLend.updateCreditLimit(10_000e6, 13500, 1200, expiry, 550, signature);
    }
    
    function testRejectLowFairScore() public {
        uint256 expiry = block.timestamp + 1 days;
        uint256 fairScore = 300; // Below minimum 350
        
        bytes memory signature = _createAttestation(
            borrower, 2_000e6, 17500, 1600, expiry, fairScore
        );
        
        vm.prank(borrower);
        vm.expectRevert("FairScore too low");
        fairLend.updateCreditLimit(2_000e6, 17500, 1600, expiry, fairScore, signature);
    }
    
    // ============ Lending Pool Tests ============
    
    function testDepositSenior() public {
        uint256 amount = 10_000 * 10**USDC_DECIMALS;
        
        vm.prank(lender);
        fairLend.depositSenior(amount);
        
        assertEq(fairLend.seniorDeposits(lender), amount);
        assertEq(fairLend.seniorTrancheTVL(), amount);
    }
    
    function testDepositJunior() public {
        uint256 amount = 5_000 * 10**USDC_DECIMALS;
        
        vm.prank(lender);
        fairLend.depositJunior(amount);
        
        assertEq(fairLend.juniorDeposits(lender), amount);
        assertEq(fairLend.juniorTrancheTVL(), amount);
    }
    
    function testWithdrawSenior() public {
        uint256 amount = 10_000 * 10**USDC_DECIMALS;
        
        vm.prank(lender);
        fairLend.depositSenior(amount);
        
        vm.prank(lender);
        fairLend.withdrawSenior(amount);
        
        assertEq(fairLend.seniorDeposits(lender), 0);
        assertEq(usdc.balanceOf(lender), 100_000 * 10**USDC_DECIMALS);
    }
    
    // ============ Borrowing Tests ============
    
    function testBorrow() public {
        // Setup: Deposit liquidity
        vm.prank(lender);
        fairLend.depositSenior(50_000 * 10**USDC_DECIMALS);
        
        // Setup: Credit limit for borrower (Silver tier)
        _setupCreditLimit(borrower, 550);
        
        // Borrow
        uint256 borrowAmount = 5_000 * 10**USDC_DECIMALS;
        uint256 duration = 30 days;
        
        uint256 borrowerUsdcBefore = usdc.balanceOf(borrower);
        uint256 borrowerWethBefore = weth.balanceOf(borrower);
        
        vm.prank(borrower);
        fairLend.borrow(borrowAmount, duration);
        
        // Check loan created
        (,,,,, bool active) = fairLend.loans(borrower);
        assertTrue(active);
        
        // Check USDC received
        assertEq(usdc.balanceOf(borrower), borrowerUsdcBefore + borrowAmount);
        
        // Check collateral taken (135% for Silver)
        uint256 collateralRequired = (borrowAmount * 13500) / 10000;
        // Collateral is in WETH terms, need to convert
    }
    
    function testRepay() public {
        // Setup
        vm.prank(lender);
        fairLend.depositSenior(50_000 * 10**USDC_DECIMALS);
        _setupCreditLimit(borrower, 550);
        
        // Borrow
        uint256 borrowAmount = 5_000 * 10**USDC_DECIMALS;
        vm.prank(borrower);
        fairLend.borrow(borrowAmount, 30 days);
        
        // Fast forward time
        vm.warp(block.timestamp + 15 days);
        
        // Calculate interest
        uint256 interest = fairLend.calculateInterest(borrower);
        
        // Ensure borrower has enough to repay
        usdc.mint(borrower, interest);
        
        // Repay
        vm.prank(borrower);
        fairLend.repay();
        
        // Check loan closed
        (,,,,, bool active) = fairLend.loans(borrower);
        assertFalse(active);
        
        // Check successful loan count
        assertEq(fairLend.successfulLoans(borrower), 1);
    }
    
    // ============ Vouching Tests ============
    
    function testVouchFor() public {
        // Setup voucher with high enough score
        _setupCreditLimit(voucher, 650); // Gold tier
        
        uint256 vouchAmount = 1_000 * 10**USDC_DECIMALS;
        
        vm.prank(voucher);
        fairLend.vouchFor(borrower, vouchAmount);
        
        assertEq(fairLend.voucherStakes(voucher), vouchAmount);
        assertEq(fairLend.getTotalVouched(borrower), vouchAmount);
    }
    
    function testCannotVouchWithLowScore() public {
        // Setup voucher with low score
        _setupCreditLimit(voucher, 450); // Bronze tier, below 500 minimum
        
        vm.prank(voucher);
        vm.expectRevert("FairScore too low to vouch");
        fairLend.vouchFor(borrower, 1_000 * 10**USDC_DECIMALS);
    }
    
    // ============ Liquidation Tests ============
    
    function testLiquidateOverdue() public {
        // Setup
        vm.prank(lender);
        fairLend.depositSenior(50_000 * 10**USDC_DECIMALS);
        _setupCreditLimit(borrower, 550);
        
        // Borrow
        vm.prank(borrower);
        fairLend.borrow(5_000 * 10**USDC_DECIMALS, 30 days);
        
        // Fast forward past due date
        vm.warp(block.timestamp + 31 days);
        
        // Liquidate
        address keeper = address(10);
        vm.prank(keeper);
        fairLend.liquidate(borrower);
        
        // Check loan closed
        (,,,,, bool active) = fairLend.loans(borrower);
        assertFalse(active);
        
        // Check borrower blacklisted
        assertTrue(fairLend.blacklisted(borrower));
        
        // Check default count
        assertEq(fairLend.defaultedLoans(borrower), 1);
    }
    
    // ============ Admin Tests ============
    
    function testPause() public {
        vm.prank(owner);
        fairLend.setPaused(true);
        
        vm.prank(lender);
        vm.expectRevert("Protocol paused");
        fairLend.depositSenior(1000e6);
    }
    
    function testBlacklist() public {
        vm.prank(owner);
        // First need to blacklist through liquidation or direct call
        // Test that blacklisted users can't borrow
    }
}
