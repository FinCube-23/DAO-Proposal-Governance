import { ethers, upgrades } from "hardhat";
import { trackDataSaver } from "./trackDataSaver";

const proxyAddress = require("../../json-log/fincubeDAO_contract_address.json");
const PROXY = proxyAddress.FinCubeDAOContract;

async function main() {
  console.log("Deploying FinCube-DAO contract...");
  // The getContractFactory() parameter is Temporary. 
  // If any upgrade is required just replace it with the new Smart Contract Name.
  const FinCubeDAO_V2 = await ethers.getContractFactory(
    "FinCubeDAO"
  );
  const finCubeDAO_V2 = await upgrades.upgradeProxy(
    PROXY,
    FinCubeDAO_V2
  );
  var smartContractAddress = await finCubeDAO_V2.getAddress();
  console.log(
    "FinCube-DAO-V2 Proxy Contract ( Must be Same ) deployed to : ",
    smartContractAddress
  );
  smartContractAddress = await upgrades.erc1967.getImplementationAddress(
    smartContractAddress
  );
  console.log(
    "FinCube-DAO-V2 Previous Contract implementation address is : ",
    smartContractAddress
  );
  // Storing the Smart Contract Implementation Address.
  await trackDataSaver(
    "fincubeDAO_V2_upgraded_contract_implementation_address",
    "FinCubeDAOImplementationAddress",
    smartContractAddress
  );

  console.log(
    "==> To get the current contract's implementation address you must verify the proxy address <=="
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
// command: npx hardhat run scripts/02_upgrade_dao_uup_v2.ts --network sepolia
// verify command: npx hardhat verify --network sepolia 0xDeployedContractAddress
