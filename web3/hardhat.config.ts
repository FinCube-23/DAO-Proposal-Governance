import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-storage-layout';
import "hardhat-gas-reporter"

const config: HardhatUserConfig = {
  solidity: "0.8.24",
};

export default config;
