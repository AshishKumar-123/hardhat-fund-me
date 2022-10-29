const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe", async function () {
    
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    const sendValue = ethers.utils.parseEther("1");

    beforeEach( async function() {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    })

    describe("constructor", async function() {
        it("Sets the aggregator address correctly", async function() {
            const response = await fundMe.priceFeed();
            assert.equal(response, mockV3Aggregator.address);
        })
    })

    describe("fund", async function() {
        it("Fails if not enough ethers sent", async function() {
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
        })

        it("Update the amount funded data structure", async function() {
            await fundMe.fund({value:sendValue});
            const response = await fundMe.addressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        })

        it("Adds funders to funders list", async function() {
            await fundMe.fund({value:sendValue});
            const funder = await fundMe.funders(0);
            assert.equal(funder,deployer);
        })
    })

    describe("withdraw", async function() {
        beforeEach(async function() {
            await fundMe.fund({value:sendValue});
        })

        it("Withdraw ETH from a single founder", async function() {
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

            const transactionResponse = await fundMe.withdraw({value:sendValue});
            const transactionReceipt = await transactionResponse.wait(1);
            const {gasUsed, effectiveGasPrice} = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);
            
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

            assert.equal(endingFundMeBalance, 0);
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString());
        })

        it("Allow us to withdraw funds with multiple funders", async function() {
            const accounts = await ethers.getSigners();
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                await fundMeConnectedContract.fund({value:sendValue})
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const {gasUsed, effectiveGasPrice} = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

            assert.equal(endingFundMeBalance, 0);
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString());

            await expect(fundMe.funders(0)).to.be.reverted

            // Checking if the addressToAmountFunded is correctly rested to zero value after the withdraw is completed.
            for (i = 1; i < 6; i++) {
                assert.equal(await fundMe.addressToAmountFunded(accounts[i].address), 0);
            }
        })

        it("Only allow the owner of the contract to withdraw the funds", async function() {
            const accounts = await ethers.getSigners();
            const attackerConnectedAccounts = await fundMe.connect(accounts[1]);
            await expect(attackerConnectedAccounts.withdraw()).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner');
        })

    })
})