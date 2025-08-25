import {
  Inject,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { DAOContract } from './entities/DAO-contract-entity';
import { RPCProvider } from './entities/RPC-Provider-entity';
import { ethers } from 'ethers';
import { validateAuth } from '@fincube/validate-auth';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class Web3ProxyService {
  private contract: ethers.Contract;
  private readonly logger = new Logger(Web3ProxyService.name);
  constructor(
    private readonly daoContract: DAOContract,
    private readonly JSONRPCProvider: RPCProvider,
    @Inject('USER_MANAGEMENT_SERVICE') private umsRabbitClient: ClientProxy,
  ) {
    const provider = new ethers.JsonRpcProvider(
      this.JSONRPCProvider.ALCHEMY_ENDPOINT,
    );
    const wallet = new ethers.Wallet(this.daoContract.signer, provider);
    this.contract = new ethers.Contract(
      this.daoContract.address,
      this.daoContract.abi,
      wallet,
    );
  }

  private provider(): ethers.JsonRpcProvider {
    const provider = new ethers.JsonRpcProvider(
      this.JSONRPCProvider.ALCHEMY_ENDPOINT,
    );
    return provider;
  }

  async placeProposalWithMultipleWallets(): Promise<any> {
    // Load 15 wallets from environment variables
    const wallets = [];
    for (let i = 1; i <= 15; i++) {
      const privateKey = process.env[`WALLET${i}_PRIVATE_KEY`];
      if (!privateKey) {
        throw new Error(`Missing WALLET${i} credentials in environment`);
      }
      const wallet = new ethers.Wallet(privateKey, this.provider());
      wallets.push(wallet);
    }

    // Place proposal with each wallet in parallel
    const results = await Promise.all(
      wallets.map(async (wallet) => {
        this.contract = new ethers.Contract(
          this.daoContract.address,
          this.daoContract.abi,
          wallet,
        );
        try {
          // Use the correct contract function and pass extracted params
          const tx = await this.contract.newMemberApprovalProposal();
          await tx.wait();

          console.log('Hash:', tx.hash);
          console.log('Wallet address:', wallet.address);

          // Ensure values are properly defined before creating body
          if (!tx.hash || !wallet.address) {
            throw new Error('Transaction hash or wallet address is undefined');
          }

          const body = {
            proposal_type: 'membership',
            metadata: 'Dummy metadata',
            proposer_address: String(wallet.address).trim(),
            trx_hash: String(tx.hash).trim(),
          };

          // Validate JSON can be stringified before sending
          try {
            JSON.stringify(body);
          } catch (jsonError) {
            console.error('JSON stringify error:', jsonError);
            throw new Error(`Invalid JSON body: ${jsonError.message}`);
          }

          console.log('Body before sending:', JSON.stringify(body, null, 2));

          // Use Docker Compose service name for inter-container communication
          await axios.post('http://dao-app:3000/proposal-service', body, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log('POST request sent successfully');

          return { address: wallet.address, txHash: tx.hash };
        } catch (err) {
          console.error('Full error:', err);
          return { address: wallet.address, error: err.message };
        }
      }),
    );
    return results;
  }

  async getBalance(req: any, address: string): Promise<number> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    const provider = this.provider();
    const balance = await provider.getBalance(address);
    return Number(balance);
  }

  async getProposalThreshold(req: any): Promise<number> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    return await this.contract.proposalThreshold();
  }

  async getOngoingProposals(req: any): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    const proposals = await this.contract.getOngoingProposals();

    const formattedProposals = this.parseBigInt(proposals);

    return formattedProposals;
  }

  async registerMember(req, address: string, _memberURI: string): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    return await this.contract.registerMember(address, _memberURI);
  }

  async executeProposal(req: any, proposalId: number): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    return await this.contract.executeProposal(proposalId);
  }

  async checkIsMemberApproved(req, memberAddress: string): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    return await this.contract.checkIsMemberApproved(memberAddress);
  }

  parseBigInt(array: any[]) {
    return JSON.parse(
      JSON.stringify(
        array,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value), // return everything else unchanged
      ),
    );
  }

  async getProposalsByPage(
    req: any,
    cursor: number,
    howMany: number,
  ): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    const proposals = await this.contract.getProposalsByPage(cursor, howMany);

    const formattedProposals = this.parseBigInt(proposals);

    return formattedProposals;
  }

  async getProposalById(req: any, proposalId: number): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    const proposal = await this.contract.getProposalsById(proposalId);

    const formattedProposal = this.parseBigInt(proposal);

    return formattedProposal;
  }
}
