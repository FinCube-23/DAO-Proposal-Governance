# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
# Smart Contract Deployment 
The smart contract is UUPSUpgradeable. To deploy follow:

![Deploy contract flow](deploy-contract.jpg)

During adding newMembers follow:

![Approve member flow](member-proposal.jpg)