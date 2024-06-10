require('dotenv').config({ path: '.env.local' });
export class RPCProvider {
    ALCHEMY_ENDPOINT: any = process.env.ALCHEMY_ENDPOINT;
}