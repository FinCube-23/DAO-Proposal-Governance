import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { Web3ProxyService } from './web3-proxy.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { RegisterMemberBody } from './entities/RegisterMemberInterface';
import { Proposal } from './entities/ProposalInterface';

@Controller('web3-dao-proxy')
export class Web3ProxyController {
  constructor(private readonly web3ProxyService: Web3ProxyService) { }

  @Post('balance')
  @ApiOperation({ summary: "Get the balance of user address" })
  @ApiBody({
    description: "Ethereum address to check balance",
    schema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          description: 'Valid Ethereum wallet address',
        },
      },
      required: ['address'], // Mark required fields
    }
  })
  async getBalance(@Req() req, @Body('address') address: string) {
    return this.web3ProxyService.getBalance(address, req.user);
  }

  @Get('proposal-threshold')
  @ApiOperation({ summary: "Get the proposal threshold of contract" })
  async getProposalThreshold(@Req() req): Promise<number> {
    return this.web3ProxyService.getProposalThreshold(req.user);
  }

  @Get('ongoing-proposals')
  @ApiOperation({ summary: "Get the ongoing proposals" })
  async getOngoingProposals(@Req() req): Promise<any> {
    return this.web3ProxyService.getOngoingProposals(req.user);
  }

  @Get('proposal-by-id/:proposalId')
  @ApiOperation({ summary: "Get the proposal as per ID" })
  @ApiParam({
    name: 'proposalId',
    type: Number,
    description: 'ID of the proposal to retrieve',
    example: 123,
  })
  async getProposalById(@Param('proposalId') proposalId: number) {
    return this.web3ProxyService.getProposalById(proposalId);
  }

  @Post('proposals-by-page')
  @ApiOperation({ summary: "Get proposals by specifying how many you want to retrieve" })
  @ApiBody({
    description: 'Pagination details for fetching proposals',
    schema: {
      type: 'object',
      properties: {
        cursor: {
          type: 'number',
          example: 0,
          description: 'Cursor for pagination (starting point)',
        },
        howMany: {
          type: 'number',
          example: 10,
          description: 'Number of proposals to fetch',
        },
      }
    },
  })
  async getProposalsByPage(@Req() req, @Body('cursor') cursor: number, @Body('howMany') howMany: number): Promise<any> {
    return this.web3ProxyService.getProposalsByPage(cursor, howMany, req.user);
  }

  @Post('register-member')
  @ApiOperation({ summary: "PAYABLE: Register a new member to DAO" })
  @ApiBody({
    description: "Ethereum address to check balance",
    schema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          description: 'Valid Ethereum wallet address',
        },
        _memberURI: {
          type: 'string',
          example: 'https://example.com/member/123',
          description: 'URI for the member profile',
        },
      },
      required: ['address', '_memberURI'], // Mark required fields
    },
  })
  async registerMember(@Req() req, @Body('address') address: string, @Body('_memberURI') _memberURI: string): Promise<any> {
    return this.web3ProxyService.registerMember(address, _memberURI, req.user);
  }

  @Post('execute-proposal')
  @ApiOperation({ summary: "PAYABLE: Execute a proposal whose vote is completed" })
  @ApiBody({
    description: "Proposal ID of the proposal to execute",
    type: Number
  })
  async executeProposal(@Req() req, @Body('proposalId') proposalId: number): Promise<any> {
    return this.web3ProxyService.executeProposal(proposalId, req.user);
  }

  @Post('is-member-approved')
  @ApiOperation({ summary: "Check if a member is approved or not" })
  @ApiBody({
    description: "Ethereum address to check member approval",
    schema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          description: 'Valid Ethereum wallet address',
        },
      },
      required: ['address'], // Mark required fields
    }
  })
  async checkIsMemberApproved(@Req() req, @Body('address') memberAddress: string): Promise<any> {
    return this.web3ProxyService.checkIsMemberApproved(memberAddress, req.user);
  }



}
