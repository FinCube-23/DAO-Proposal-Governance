import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { Web3ProxyService } from './web3-proxy.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody } from '@nestjs/swagger';
import { RegisterMemberBody } from './entities/RegisterMemberInterface';
import { Proposal } from './entities/ProposalInterface';

@Controller('web3-dao-proxy')
export class Web3ProxyController {
  constructor(private readonly web3ProxyService: Web3ProxyService) { }

  @Post('balance')
  async getBalance(@Req() req, @Body('address') address: string) {
    return this.web3ProxyService.getBalance(address, req.user);
  }

  @Get('proposal-threshold')
  @UseGuards(AuthGuard('jwt'))
  async getProposalThreshold(@Req() req): Promise<number> {
    return this.web3ProxyService.getProposalThreshold(req.user);
  }

  @Get('proposal-count')
  @UseGuards(AuthGuard('jwt'))
  async getOngoingProposalCount(@Req() req): Promise<number> {
    return this.web3ProxyService.getOngoingProposalCount(req.user);
  }

  @Get('ongoing-proposals')
  @UseGuards(AuthGuard('jwt'))
  async getOngoingProposals(@Req() req): Promise<any> {
    return this.web3ProxyService.getOngoingProposals(req.user);
  }

  @Post('proposals-by-page')
  @UseGuards(AuthGuard('jwt'))
  async getProposalsByPage(@Req() req, @Body('cursor') cursor: number, @Body('howMany') howMany: number): Promise<any> {
    return this.web3ProxyService.getProposalsByPage(cursor, howMany, req.user);
  }

  @Post('register-member')
  @UseGuards(AuthGuard('jwt'))
  @ApiBody({ type: RegisterMemberBody })
  async registerMember(@Req() req, @Body('address') address: string, @Body('_memberURI') _memberURI: string): Promise<any> {
    return this.web3ProxyService.registerMember(address, _memberURI, req.user);
  }

  @Post('execute-proposal')
  @UseGuards(AuthGuard('jwt'))
  @ApiBody({ type: Proposal })
  async executeProposal(@Req() req, @Body('proposalId') proposalId: number): Promise<any> {
    return this.web3ProxyService.executeProposal(proposalId, req.user);
  }

  @Post('is-member-approved')
  @UseGuards(AuthGuard('jwt'))
  @ApiBody({ type: Proposal })
  async checkIsMemberApproved(@Req() req, @Body('address') memberAddress: string): Promise<any> {
    return this.web3ProxyService.checkIsMemberApproved(memberAddress, req.user);
  }

}
