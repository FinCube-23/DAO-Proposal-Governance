import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, } from '@nestjs/common';
import { ProposalServiceService } from './proposal-service.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { ProposalEntity } from './entities/proposal.entity';
import { ProposalDto, UpdatedProposalDto, CreatedProposalDto } from './dto/proposal.dto';
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
  placeProposal(@Body() proposal: CreatedProposalDto | UpdatedProposalDto) {
    return this.proposalService.placeProposal(proposal);
  }

  @EventPattern('create-proposal-placed')
  handleCreatedProposalPlaced(@Payload() proposal: CreatedProposalDto) {
    return this.proposalService.handleCreatedProposalPlaced(proposal);
  }

  @EventPattern('update-proposal-placed')
  handleUpdatedProposalPlaced(@Payload() proposal: UpdatedProposalDto) {
    return this.proposalService.handleUpdatedProposalPlaced(proposal);
  }

  @MessagePattern({ cmd: 'fetch-update-proposal' })
  getProposal(@Ctx() context: RmqContext) {
    return this.proposalService.getProposals();
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


