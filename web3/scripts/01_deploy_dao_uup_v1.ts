import { ethers, upgrades } from "hardhat";
import { trackDataSaver } from "./trackDataSaver";

/**
 * The Universal Upgradeable Proxies
 * Ref: https://eips.ethereum.org/EIPS/eip-1822
 * JS Package: https://www.npmjs.com/package/@openzeppelin/hardhat-upgrades
 * Implementation Ref: https://github.com/ishinu/UUPS-Proxy-Pattern-Implementation-Hardhat-/tree/main/scripts
 */
async function main() {
    // https://eips.ethereum.org/EIPS/eip-4824
    const _daoURI = {
        "@context": "https://github.com/FinCube-23/DAO-Proposal-Governance",
        "type": "DAO",
        "name": "FinCube-23",
        "description": "FinCube is a DAO for Mobile Financial Services. The DAO allows MFS entities to set policies to enable global currency transfer.",
        "membersURI": "",
        "proposalsURI": "",
        "activityLogURI": "",
        "governanceURI": "",
        "contractsURI": ""
    };
    // https://eips.ethereum.org/EIPS/eip-4824#membersuri
    const _ownerURI = {
        "@context": "https://www.bkash.com/",
        "type": "MFS",
        "name": "bKash",
        "members": [{"type": "EthereumAddress","id": "0xCB6F2B16a15560197342e6afa6b3A5620884265B"}]
    };
    const FinCubeDAO = await ethers.getContractFactory("FinCubeDAO");
    const finCubeDAO = await upgrades.deployProxy(FinCubeDAO, [JSON.stringify(_daoURI), JSON.stringify(_ownerURI)], {
        kind: "uups",
        initializer: "initialize",
      });
    await finCubeDAO.waitForDeployment();
    console.log("Fincube-DAO proxy deployed to: ", await finCubeDAO.getAddress());
    // Storing the Smart Contract Address.
    await trackDataSaver("fincubeDAO_contract_address", "FinCubeDAOContract", await finCubeDAO.getAddress());

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(
      await finCubeDAO.getAddress()
    );
    console.log(
      "FinCube-DAO Contract implementation address is : ",
      implementationAddress
    );
    // Storing the Smart Contract Implementation Address.
    await trackDataSaver(
      "fincubeDAO_V2_upgraded_contract_implementation_address",
      "FinCubeDAOImplementationAddress",
      implementationAddress
    );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// command: npx hardhat run scripts/01_deploy_dao_uup_v1.ts --network amoy
// verify command: npx hardhat verify --network amoy 0xDeployedContractAddress