import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Web3ProxyService } from './web3-proxy.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody } from '@nestjs/swagger';
import { RegisterMemberBody } from './entities/RegisterMemberInterface';
import { Proposal } from './entities/ProposalInterface';

@Controller('web3-dao-proxy')
export class Web3ProxyController {
  constructor(private readonly web3ProxyService: Web3ProxyService) { }

  @Post('balance')
  async getBalance(@Body('address') address: string) {
    return this.web3ProxyService.getBalance(address);
  }

  @Get('proposal-threshold')
  @UseGuards(AuthGuard('jwt'))
  async getProposalThreshold(): Promise<number> {
    return this.web3ProxyService.getProposalThreshold();
  }

  @Get('proposal-count')
  @UseGuards(AuthGuard('jwt'))
  async getOngoingProposalCount(): Promise<number> {
    return this.web3ProxyService.getOngoingProposalCount();
  }

  @Get('ongoing-proposals')
  @UseGuards(AuthGuard('jwt'))
  async getOngoingProposals(): Promise<any> {
    return this.web3ProxyService.getOngoingProposals();
  }

  @Post('register-member')
  @UseGuards(AuthGuard('jwt'))
  @ApiBody({ type: RegisterMemberBody })
  async registerMember(@Body('address') address: string, @Body('_memberURI') _memberURI: string): Promise<any> {
    return this.web3ProxyService.registerMember(address, _memberURI);
  }

  @Post('execute-proposal')
  @UseGuards(AuthGuard('jwt'))
  @ApiBody({ type: Proposal })
  async executeProposal(@Body('proposalId') proposalId: number): Promise<any> {
    return this.web3ProxyService.executeProposal(proposalId);
  }

}
