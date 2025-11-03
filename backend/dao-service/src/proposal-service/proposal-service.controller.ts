import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProposalServiceService } from './proposal-service.service';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProposalEntity, ProposalStatus } from './entities/proposal.entity';
import { PaginatedProposalResponse, ProposalDto } from './dto/proposal.dto';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';

@Controller('proposal-service')
export class ProposalServiceController {
  constructor(private readonly proposalService: ProposalServiceService) {}

  // 💬 MessagePattern expects a response | This is a publisher
  @Post()
  @ApiTags('Proposal Off-chain')
  @ApiOperation({
    summary:
      'Inserts new proposal data at off-chain DB and emit message to Audit Trail Service',
  })
  @ApiOkResponse({
    status: 200,
    description: 'The record has been successfully created.',
    type: ProposalEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  // ✅ Add this decorator to specify the request body schema for Swagger
  @ApiBody({
    description: 'Proposal data with on-chain transaction information',
    type: ProposalDto,
    examples: {
      membershipProposal: {
        summary: 'Membership Proposal Example',
        description: 'Example of adding a new member to the DAO',
        value: {
          proposal_type: 'membership',
          metadata:
            '{"title": "Add new member", "description": "Proposal to add Alice to the DAO", "memberAddress": "0x742d35Cc6634C0532925a3b8D58"}',
          onChainData: {
            transactionHash:
              '0xe53c868443504e899c093736281f99a9d0b99d66a7b2ecd53575209fe69a8d2a',
            signedBy: '0xBb85D1852E67D6BEaa64A7eDba802189F0714F97',
            signedWith: 'MetaMask',
            chainId: '1',
            context: 'Proposal submitted via DAO governance interface',
          },
        },
      },
      currencyProposal: {
        summary: 'Currency Proposal Example',
        description: 'Example of proposing a new currency',
        value: {
          proposal_type: 'general',
          metadata:
            '{"title": "Add USDC support", "description": "Proposal to add USDC as accepted currency", "tokenAddress": "0xA0b86a33E6B6a929b83E4e86a9e4c0b1f1e8c8b2"}',
          onChainData: {
            transactionHash:
              '0xf64d879954e7a6e8c12579b635d4ff8e7d1b5c6a8b3e2d1c9f8e7d6c5b4a3928',
            signedBy: '0xCc45D2871423E67D6BEaa64A7eDba802189F0715',
            signedWith: 'WalletConnect',
            chainId: '137',
            context: 'Proposal submitted via mobile wallet',
          },
        },
      },
      minimalProposal: {
        summary: 'Minimal Required Fields',
        description: 'Example with only required fields',
        value: {
          proposal_type: 'membership',
          metadata: '{"title": "Simple proposal"}',
          onChainData: {
            transactionHash:
              '0xe53c868443504e899c093736281f99a9d0b99d66a7b2ecd53575209fe69a8d2a',
            signedBy: '0xBb85D1852E67D6BEaa64A7eDba802189F0714F97',
          },
        },
      },
    },
  })
  async create(
    @Req() req,
    @Body() proposal_entity: ProposalDto,
  ): Promise<ProposalEntity> {
    return this.proposalService.create(req, proposal_entity);
  }

  // 💬 MessagePattern expects a response | This is a Producer
  @Patch('execute-proposal')
  @ApiTags('Proposal Update')
  @ApiOperation({
    summary:
      'Update executed proposal using ID at off-chain DB and emit message to Audit Trail Service',
  })
  @ApiOkResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: ProposalEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({
    description: 'Payload for executing a proposal',
    schema: {
      example: {
        proposalId: 1,
        onChainData: {
          transactionHash:
            '0xf64d879954e7a6e8c12579b635d4ff8e7d1b5c6a8b3e2d1c9f8e7d6c5b4a3928',
          signedBy: '0xCc45D2871423E67D6BEaa64A7eDba802189F0715',
          signedWith: 'WalletConnect',
          chainId: '137',
          context: 'Proposal submitted via mobile wallet',
        },
      },
    },
  })
  async executeProposal(
    @Req() req,
    @Body('proposalId') proposalId: number,
  ): Promise<ProposalEntity> {
    return this.proposalService.executeProposal(req, proposalId);
  }

  // 💬 MessagePattern expects a response | This is a Producer
  @Patch('cancel-proposal')
  @ApiTags('Proposal Update')
  @ApiOperation({
    summary:
      'Update executed proposal using ID at off-chain DB and emit message to Audit Trail Service',
  })
  @ApiOkResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: ProposalEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({
    description: 'Payload for cancelling a proposal',
    schema: {
      example: {
        proposalId: 1,
        onChainData: {
          transactionHash:
            '0xf64d879954e7a6e8c12579b635d4ff8e7d1b5c6a8b3e2d1c9f8e7d6c5b4a3928',
          signedBy: '0xCc45D2871423E67D6BEaa64A7eDba802189F0715',
          signedWith: 'WalletConnect',
          chainId: '137',
          context: 'Proposal submitted via mobile wallet',
        },
      },
    },
  })
  async cancelProposal(
    @Req() req,
    @Body('proposalId') proposalId: number,
  ): Promise<ProposalEntity> {
    return this.proposalService.cancelProposal(req, proposalId);
  }

  @Get(':id')
  @ApiTags('Proposal Off-chain')
  @ApiOperation({ summary: 'Get proposal by ID' })
  @ApiResponse({ status: 200, type: ProposalEntity })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  async findOne(
    @Param('id') id: number,
    @Req() req: any,
  ): Promise<ProposalEntity> {
    return this.proposalService.findById(req, id);
  }

  @Get()
  @ApiTags('Proposal Off-chain')
  @ApiOperation({
    summary: 'Get paginated list of proposals with selected fields',
  })
  @ApiResponse({
    status: 200,
    description: 'Chunk of proposal list are delivered.',
    type: PaginatedProposalResponse,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'filter', required: false, type: String })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('filter') filter: ProposalStatus,
    @Req() req,
  ): Promise<PaginatedProposalResponse> {
    return this.proposalService.findAll(req, page, limit, filter);
  }

  @Get('filter/:status')
  @ApiTags('Proposal Off-chain')
  @ApiOperation({ summary: 'Get list of proposals filtered by status' })
  @ApiResponse({
    status: 200,
    description: 'Filtered list of proposals is delivered.',
    type: [ProposalEntity],
  })
  @ApiParam({ name: 'status', required: true, enum: ProposalStatus }) // Use ApiParam instead of ApiQuery
  async findByStatus(
    @Param('status') status: ProposalStatus,
    @Req() req,
  ): Promise<ProposalEntity[]> {
    return this.proposalService.findByStatus(req, status);
  }
  // // 📡 EventPattern is fire-and-forget, so no return value as no response expected | This is a Consumer
  // @EventPattern('general-proposal-placed')
  // handleCreatedProposalPlaced(
  //   @Payload() proposal: ResponseTransactionStatusDto,
  // ) {
  //   this.proposalService.handleCreatedProposalPlacedEvent(proposal);
  // }
}
