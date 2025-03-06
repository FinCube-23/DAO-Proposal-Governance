import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, DefaultValuePipe, ParseIntPipe, Query, } from '@nestjs/common';
import { ProposalServiceService } from './proposal-service.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProposalEntity, ProposalStatus } from './entities/proposal.entity';
import { PaginatedProposalResponse, ProposalDto, ProposalListDto, UpdateProposalDto } from './dto/proposal.dto';
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';

@Controller('proposal-service')
export class ProposalServiceController {
  constructor(private readonly proposalService: ProposalServiceService) { }

  // 💬 MessagePattern expects a response | This is a publisher
  @Post()
  @ApiTags("Proposal Off-chain")
  @ApiOperation({ summary: "Inserts new proposal data at off-chain DB and emit message to Audit Trail Service", })
  @ApiOkResponse({ status: 200, description: 'The record has been successfully created.', type: ProposalEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Req() req, @Body() proposal_entity: ProposalDto): Promise<ProposalEntity> {
    return this.proposalService.create(proposal_entity, req.user);
  }

  // 💬 MessagePattern expects a response | This is a publisher
  @Patch('execute-proposal')
  @ApiTags("Proposal Update")
  @ApiOperation({ summary: 'Update executed proposal using ID at off-chain DB and emit message to Audit Trail Service', })
  @ApiOkResponse({ status: 200, description: 'The record has been successfully updated.', type: ProposalEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({
    description: 'Payload for executing a proposal',
    schema: {
      example: {
        proposalId: 1,
        transactionHash: "0xe53c868443504e899c093736281f99a9d0b99d66a7b2ecd53575209fe69a8d2a"
      }
    }
  })
  async executeProposal(@Req() req, @Body() executeProposalDto: UpdateProposalDto): Promise<ProposalEntity> {
    return this.proposalService.executeProposal(executeProposalDto);
  }

  // 💬 MessagePattern expects a response | This is a publisher
  @Patch('cancel-proposal')
  @ApiTags("Proposal Update")
  @ApiOperation({ summary: 'Update executed proposal using ID at off-chain DB and emit message to Audit Trail Service', })
  @ApiOkResponse({ status: 200, description: 'The record has been successfully updated.', type: ProposalEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({
    description: 'Payload for cancelling a proposal',
    schema: {
      example: {
        proposalId: 1,
        transactionHash: "0xe53c868443504e899c093736281f99a9d0b99d66a7b2ecd53575209fe69a8d2a"
      }
    }
  })
  async cancelProposal(@Req() req, @Body() cancelProposalDto: UpdateProposalDto): Promise<ProposalEntity> {
    return this.proposalService.cancelProposal(cancelProposalDto);
  }

  @Get(':id')
  @ApiTags("Proposal Off-chain")
  @ApiOperation({ summary: 'Get proposal by ID' })
  @ApiResponse({ status: 200, type: ProposalEntity })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  async findOne(@Param('id') id: number): Promise<ProposalEntity> {
    return this.proposalService.findById(id);
  }

  @Get()
  @ApiTags("Proposal Off-chain")
  @ApiOperation({ summary: 'Get paginated list of proposals with selected fields' })
  @ApiResponse({ status: 200, description: 'Chunk of proposal list are delivered.', type: PaginatedProposalResponse })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ): Promise<PaginatedProposalResponse> {
    return this.proposalService.findAll(page, limit);
  }

  @Get('filter/:status')
  @ApiTags("Proposal Off-chain")
  @ApiOperation({ summary: 'Get list of proposals filtered by status' })
  @ApiResponse({ status: 200, description: 'Filtered list of proposals is delivered.', type: [ProposalEntity] })
  @ApiParam({ name: 'status', required: true, enum: ProposalStatus }) // Use ApiParam instead of ApiQuery
  async findByStatus(@Param('status') status: ProposalStatus): Promise<ProposalEntity[]> {
    return this.proposalService.findByStatus(status);
  }

  // 📡 EventPattern is fire-and-forget, so no return value as no response expected | This is a Consumer
  @EventPattern('create-proposal-placed')
  handleCreatedProposalPlaced(@Payload() proposal: ResponseTransactionStatusDto, @Ctx() context: RmqContext) {
    this.proposalService.handleCreatedProposalPlacedEvent(proposal, context);
  }

  // 📡 EventPattern is fire-and-forget, so no return value as no response expected | This is a Consumer
  @EventPattern('membership-proposal-update')
  handleProposalUpdated(@Payload() proposal: ResponseTransactionStatusDto, @Ctx() context: RmqContext) {
    this.proposalService.handleProposalUpdatedEvent(proposal, context);
  }

}


