import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, } from '@nestjs/common';
import { ProposalServiceService } from './proposal-service.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { ProposalEntity } from './entities/proposal.entity';
import { ProposalDto, CreatedProposalDto } from './dto/proposal.dto';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller('proposal-service')
export class ProposalServiceController {
  constructor(private readonly proposalService: ProposalServiceService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBody({ type: ProposalEntity })
  @ApiResponse({ status: 200, description: 'The record has been successfully created.', type: ProposalEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Req() req, @Body() proposal_entity: ProposalEntity): Promise<ProposalEntity> {
    return this.proposalService.create(proposal_entity, req.user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findProposal(@Req() req): Promise<ProposalEntity[]> {
    return this.proposalService.findAllProposals(req.user);
  }

  @Post('place-proposal')
  @ApiBody({ type: CreatedProposalDto })
  @ApiResponse({ status: 200, description: 'The message has been successfully pushed.', type: CreatedProposalDto })
  placeProposal(@Body() proposal: CreatedProposalDto) {
    return this.proposalService.placeProposal(proposal);
  }

  // 📡 EventPattern is fire-and-forget, so no return value as no response expected | This is a Consumer
  @EventPattern('create-proposal-placed')
  handleCreatedProposalPlaced(@Payload() proposal: CreatedProposalDto, @Ctx() context: RmqContext) {
    console.log('GG');
    this.proposalService.handleCreatedProposalPlaced(proposal, context);
  }

  // 💬 MessagePattern expects a response | This is a publisher
  @Post('push-pending-proposal')
  @ApiBody({ type: CreatedProposalDto })
  @ApiResponse({ status: 200, description: 'The message has been successfully queued.', type: CreatedProposalDto })
  pushPendingProposal(@Body() proposal: CreatedProposalDto): any  {
    return this.proposalService.handlePendingProposal(proposal);
  }

  @Get('proposals/updated')
  async getUpdatedProposals(): Promise<any> {
    return this.proposalService.getUpdatedProposals();
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAllProposals(@Req() req): Promise<ProposalEntity[]> {
    return this.proposalService.findAll(req.user);
  }
  
}


