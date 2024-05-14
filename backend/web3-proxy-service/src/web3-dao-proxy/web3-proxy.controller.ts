import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Web3ProxyService } from './web3-proxy.service';


@Controller('web3-dao-proxy')
export class Web3ProxyController {
  constructor(private readonly web3ProxyService: Web3ProxyService) { }

  @Post()
  async getBalance(@Body('address') address: string) {
    return this.web3ProxyService.getBalance(address);
  }

  @Get()
  async getProposalThreshold(): Promise<number> {
    return this.web3ProxyService.getProposalThreshold();
  }

  @Get()
  async getOngoingProposalCount(): Promise<number> {
    return this.web3ProxyService.getOngoingProposalCount();
  }

  @Get()
  async getOngoingProposals(): Promise<any> {
    return this.web3ProxyService.getOngoingProposals();
  }

  @Post()
  async registerMember(@Body('address') address: string, @Body('_memberURI') _memberURI: string): Promise<any> {
    return this.web3ProxyService.registerMember(address, _memberURI);
  }

  @Post()
  async executeProposal(@Body('proposalId') proposalId: number): Promise<any> {
    return this.web3ProxyService.executeProposal(proposalId);
  }

}
