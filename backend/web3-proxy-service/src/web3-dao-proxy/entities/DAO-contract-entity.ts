require('dotenv').config({ path: '.env.local' });
export class DAOContract {
    address: string = process.env.CONTRACT_ADDRESS;
    abi: string = process.env.CONTRACT_ABI;
    signer: string = process.env.PRIVATE_KEY;
}