const {networkConfig} = require('../helper-hardhat-config');
const {network} = require("hardhat");
const { verify } = require("../utils/verify")
require("dotenv").config();

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;

    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const fundMe = await deploy("FundMe", {
        from:deployer,
        args:[ethUsdPriceFeedAddress], //put the priceFeed here
        log:true,
        waitConfirmations:network.config.blockConfirmations || 1
    })
    log("------------------------------------------------")
    log(`FundMe deployed at ${fundMe.address}`)

    if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress]);
    } 
    log("------------------------------------------------")

}