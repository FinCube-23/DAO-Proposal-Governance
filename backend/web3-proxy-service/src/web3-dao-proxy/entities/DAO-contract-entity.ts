require('dotenv').config({ path: '.env' });
const artifacts = require('../../../artifacts/contracts/FincubeDAO.sol/FinCubeDAO.json');
export class DAOContract {
  address: any = process.env.CONTRACT_ADDRESS;
  abi: any = artifacts.abi;
  signer: any = process.env.WALLET_PRIVATE_KEY;
}
