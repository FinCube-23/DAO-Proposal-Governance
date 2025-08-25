require('dotenv').config({ path: '.env' });
export class RPCProvider {
  ALCHEMY_ENDPOINT: any = process.env.ALCHEMY_ENDPOINT;
}
