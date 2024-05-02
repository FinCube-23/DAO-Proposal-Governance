import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DAOModule = buildModule("FinCubeDAO", (m) => {
    const daoURI = {
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
    const ownerURI = {
        "@context": "https://www.bkash.com/",
        "type": "MFS",
        "name": "bKash",
        "members": [{"type": "EthereumAddress","id": "0xCB6F2B16a15560197342e6afa6b3A5620884265B"}]
    }

    const dao = m.contract("FinCubeDAO", [JSON.stringify(daoURI), JSON.stringify(ownerURI)]);

    return { dao };
});

export default DAOModule;
