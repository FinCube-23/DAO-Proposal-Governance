import { HardhatUserConfig } from "hardhat/config";
import '@openzeppelin/hardhat-upgrades';
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-storage-layout';
import "hardhat-gas-reporter"
import '@openzeppelin/hardhat-upgrades';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  networks: {
    // Ref: https://trufflesuite.com/docs/truffle/getting-started/using-the-truffle-dashboard/#usage-with-non-truffle-tooling
    mumbai: {
      url: `${process.env.MUMBAI_ENDPOINT}/${process.env.MUMBAI_API_KEY}`,
      gasPrice: 50000000000,
      accounts: [`0x${process.env.WALLET_PRIVATE_KEY}`],
    },
    sepolia: {
      url: `${process.env.SEPOLIA_ENDPOINT}/${process.env.SEPOLIA_API_KEY}`,
      gasPrice: 50000000000,
      accounts: [`0x${process.env.WALLET_PRIVATE_KEY}`],
    },
  },

  // https://hardhat.org/hardhat-runner/docs/guides/verifying
  // (npm etherscan deprecated)
  // https://coinsbench.com/verify-smart-contract-on-polygonscan-using-hardhat-9b8331dbd888
  etherscan: {
    apiKey: {
      // Polygon
      polygonMumbai: process.env.POLYGONSCAN_MUMBAI_API_KEY,

      // Sepolia
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },

};



export default config;
