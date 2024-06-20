import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProposalUpdateService } from './proposal-update.service';
import { ProposalUpdateDto } from './dto/proposal-update.dto';
import { Logger } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('proposal-update')
export class ProposalUpdateController {

  private readonly logger = new Logger(ProposalUpdateController.name);
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


  // new apis for proposal updates
  @Get('created')
  @ApiResponse({
    status: 200,
    description: 'The created proposals have been successfully retrieved.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
 
  async getProposalsCreated(): Promise<any> {
    try {
      this.logger.log('Fetching created proposals');
      return await this.proposalUpdateService.getProposalsCreated();
    } catch (error) {
      this.logger.error('Error fetching created proposals:', error);
      throw error;
    }
  }

  @Get('executed')
  @ApiResponse({
    status: 200,
    description: 'The executed proposals have been successfully retrieved.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProposalsExecuted(): Promise<any> {
    try {
      this.logger.log('Fetching executed proposals');
      return await this.proposalUpdateService.getProposalsExecuted();
    } catch (error) {
      this.logger.error('Error fetching executed proposals:', error);
      throw error;
    }
  }

  @Get('canceled')
  @ApiResponse({
    status: 200,
    description: 'The canceled proposals have been successfully retrieved.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProposalsCanceled(): Promise<any> {
    try {
      this.logger.log('Fetching canceled proposals');
      return await this.proposalUpdateService.getProposalsCanceled();
    } catch (error) {
      this.logger.error('Error fetching canceled proposals:', error);
      throw error;
    }
  }

}
