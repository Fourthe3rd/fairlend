// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/FairLendCore.sol";

contract DeployFairLend is Script {
    function run() external {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address lendingToken = vm.envAddress("LENDING_TOKEN"); // USDC
        address collateralToken = vm.envAddress("COLLATERAL_TOKEN"); // WETH
        address fairScaleSigner = vm.envAddress("FAIRSCALE_SIGNER");
        address priceOracle = vm.envAddress("PRICE_ORACLE"); // Chainlink

        vm.startBroadcast(deployerPrivateKey);

        FairLendCore fairLend = new FairLendCore(
            lendingToken,
            collateralToken,
            fairScaleSigner,
            priceOracle
        );

        console.log("FairLendCore deployed to:", address(fairLend));
        console.log("Lending Token:", lendingToken);
        console.log("Collateral Token:", collateralToken);
        console.log("FairScale Signer:", fairScaleSigner);

        vm.stopBroadcast();
    }
}
