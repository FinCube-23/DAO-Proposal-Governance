require('dotenv').config({ path: '.env.local' });
export class RPCProvider {
    ALCHEMY_ENDPOINT: string = process.env.ALCHEMY_ENDPOINT;
}