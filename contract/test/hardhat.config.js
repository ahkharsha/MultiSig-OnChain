require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    ethereumSepolia: {
      url: process.env.NEXT_PUBLIC_SEPOLIA_RPC,
      accounts: [`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY}`],
    },
  },
};