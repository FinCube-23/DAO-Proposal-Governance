import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProposalUpdateService } from './proposal-update.service';
import { ProposalUpdateDto } from './dto/proposal-update.dto';

import { ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('proposal-update')
export class ProposalUpdateController {
  constructor(private readonly proposalUpdateService: ProposalUpdateService) {}

  @Post('update-proposal')
  @ApiBody({ type: ProposalUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'The message has been successfully pushed.',
    type: ProposalUpdateDto,
  })
  placeProposal(@Body() proposal: ProposalUpdateDto) {
    console.log("in 3003 place proposal ");
    return this.proposalUpdateService.placeProposal(proposal);
  }

  @Get('get-proposals')
  getProposals() {
    console.log("in 3003 get proposal ");
    return this.proposalUpdateService.getUpdatedProposals();
  }
}
