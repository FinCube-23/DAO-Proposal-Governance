import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, } from '@nestjs/common';
import { ProposalServiceService } from './proposal-service.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { ProposalEntity } from './entities/proposal.entity';
import { ProposalDto, CreatedProposalDto, MessageEnvelopeDto, PendingTransactionDto } from './dto/proposal.dto';
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
 // @UseGuards(AuthGuard('jwt'))
  @ApiBody({ type: ProposalEntity })
  @ApiResponse({ status: 200, description: 'The record has been successfully created.', type: ProposalEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Req() req, @Body() proposal_entity: ProposalEntity): Promise<ProposalEntity> {
    return this.proposalService.create(proposal_entity, req.user);
  }

  @Get()
  //@UseGuards(AuthGuard('jwt'))
  async findProposal(@Req() req): Promise<ProposalEntity[]> {
    return await this.proposalService.findAllProposals(req.user);
  }

  // 📡 EventPattern is fire-and-forget, so no return value as no response expected | This is a Consumer
  @EventPattern('create-proposal-placed')
  handleCreatedProposalPlaced(@Payload() proposal: ResponseTransactionStatusDto, @Ctx() context: RmqContext) {
    this.proposalService.handleCreatedProposalPlacedEvent(proposal, context);
  }

}


