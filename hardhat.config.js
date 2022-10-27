require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-deploy");

const GOREILLY_RPC_URL = process.env.GOREILLY_RPC_URL || "https://eth-goreilly";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xffdfd";  
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "kdjfkldja93053k4jdfd";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "sdfdfdsdf";


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork:"hardhat",
  solidity:{
    compilers:[
      {version: "0.8.8"},
      {version:"0.8.0"}
    ]
  },
  networks:{
    hardhat:{
      chainId:31337
    },
    goreilly:{
      url: GOREILLY_RPC_URL,
      accounts:[PRIVATE_KEY],
      chainId:5,
      blockConfirmations:6
    },
    localhost:{
      url:"http://127.0.0.1:8545/",
      chainId:31337
    }
  },
  etherscan: {
    apiKey:{
      goerli:ETHERSCAN_API_KEY,
    }
  },
  gasReporter:{
    enabled:false,
    currency:"USD",
    coinmarketcap:COINMARKETCAP_API_KEY,
  },
  namedAccounts:{
    deployer:{
      default:0,
      1:0
    }
  }
};
