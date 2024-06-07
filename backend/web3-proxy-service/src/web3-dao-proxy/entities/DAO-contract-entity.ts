require('dotenv').config({ path: '.env.local' });
const artifacts = require('../../../artifacts/contracts/FincubeDAO.sol/FinCubeDAO.json')
export class DAOContract {
    address: any = process.env.CONTRACT_ADDRESS;
    abi: any = artifacts.abi;
    signer: any = process.env.PRIVATE_KEY;
}