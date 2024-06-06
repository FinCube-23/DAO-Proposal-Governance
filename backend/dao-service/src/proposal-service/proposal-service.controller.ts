import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, } from '@nestjs/common';
import { ProposalServiceService } from './proposal-service.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { ProposalEntity } from './entities/proposal.entity';
import { ProposalDto } from './dto/proposal.dto';


@Controller('proposal-service')
export class ProposalServiceController {
  constructor(private readonly proposalService: ProposalServiceService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBody({ type: ProposalEntity })
  @ApiResponse({ status: 200, description: 'The record has been successfully created.', type: ProposalEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Body() proposal_entity: ProposalEntity): Promise<ProposalEntity> {
    return this.proposalService.create(proposal_entity);
  }

  @Get(':dao-id')
  @UseGuards(AuthGuard('jwt'))
  async findProposal(@Param('id') id: string): Promise<ProposalEntity[]> {
    return this.proposalService.findOne(+id);
  }

  @Post('place-proposal')
  @ApiBody({ type: ProposalDto })
  @ApiResponse({ status: 200, description: 'The message has been successfully pushed.', type: ProposalDto })
  placeProposal(@Body() proposal: ProposalDto) {
    return this.proposalService.placeProposal(proposal);
  }

  @Get('get-proposals')
  getProposals() {
    return this.proposalService.getProposals();
  }

}
