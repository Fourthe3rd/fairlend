// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/FairLendCore.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
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
    
    uint256 constant USDC_DECIMALS = 6;
    uint256 constant WETH_DECIMALS = 18;
    
    function setUp() public {
        signer = vm.addr(signerPrivateKey);
        
        usdc = new MockERC20("USD Coin", "USDC");
        weth = new MockWETH();
        
        vm.prank(owner);
        fairLend = new FairLendCore(
            address(usdc),
            address(weth),
            signer,
            address(0)
        );
        
        usdc.mint(lender, 100_000 * 10**USDC_DECIMALS);
        usdc.mint(borrower, 10_000 * 10**USDC_DECIMALS);
        weth.mint(borrower, 100 * 10**WETH_DECIMALS);
        
        vm.prank(lender);
        usdc.approve(address(fairLend), type(uint256).max);
        
        vm.prank(borrower);
        usdc.approve(address(fairLend), type(uint256).max);
        
        vm.prank(borrower);
        weth.approve(address(fairLend), type(uint256).max);
    }
    
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
    
    function testGetProtocolStats() public {
        vm.prank(lender);
        fairLend.depositSenior(10_000 * 10**USDC_DECIMALS);
        
        vm.prank(lender);
        fairLend.depositJunior(5_000 * 10**USDC_DECIMALS);
        
        (
            uint256 seniorTVL,
            uint256 juniorTVL,
            uint256 borrowed,
            uint256 defaulted,
            uint256 insurance,
            uint256 loanCount
        ) = fairLend.getProtocolStats();
        
        assertEq(seniorTVL, 10_000 * 10**USDC_DECIMALS);
        assertEq(juniorTVL, 5_000 * 10**USDC_DECIMALS);
        assertEq(borrowed, 0);
        assertEq(defaulted, 0);
        assertEq(insurance, 0);
        assertEq(loanCount, 0);
    }
}
