// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/FairLendCore.sol";

contract DeployFairLend is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying from:", deployer);
        console.log("Balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);

        FairLendCore fairLend = new FairLendCore(
            0x036CbD53842c5426634e7929541eC2318f3dCF7e, // USDC on Base Sepolia
            0x4200000000000000000000000000000000000006, // WETH on Base Sepolia
            deployer, // FairScale signer (deployer for testing)
            address(0) // Price oracle (not needed for testnet)
        );

        console.log("");
        console.log("========================================");
        console.log("FairLendCore deployed to:", address(fairLend));
        console.log("========================================");
        console.log("");
        console.log("Save this address! You need it for backend and frontend.");

        vm.stopBroadcast();
    }
}
