import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProposalUpdateService } from './proposal-update.service';
import {
  CreatedProposalDto,
  UpdatedProposalDto,
} from './dto/proposal-update.dto';
import { Logger } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { Ctx, RmqContext, MessagePattern, Payload} from '@nestjs/microservices';


@Controller('proposal-update')
export class ProposalUpdateController {
  private readonly logger = new Logger(ProposalUpdateController.name);
  constructor(private readonly proposalUpdateService: ProposalUpdateService) {}

  @Get('get-proposals')
  getProposals() {
    return this.proposalUpdateService.getUpdatedProposals();
  }

  // 📡 MessagePattern expects a response, Not like Fire and Forget model | This is a Consumer
  @MessagePattern('queue-pending-proposal')
  getProposal(@Payload() proposal: any, @Ctx() context: RmqContext): string {
    return this.proposalUpdateService.handlePendingProposal(proposal, context);
  }

  // 💬 Pushing Event in the Message Queue in EventPattern (No response expected) | This is Publisher
  @Post('create-proposal')
  @ApiBody({ type: CreatedProposalDto })
  @ApiResponse({
    status: 200,
    description: 'The message has been successfully pushed.',
    type: CreatedProposalDto,
  })
  placeProposal(@Body() proposal: CreatedProposalDto) {
    return this.proposalUpdateService.placeProposal(proposal);
  }

  // 💬 Pushing Event in the Message Queue in EventPattern (No response expected) | This is Publisher
  @Post('update-proposal')
  @ApiBody({ type: UpdatedProposalDto })
  @ApiResponse({
    status: 200,
    description: 'The message has been successfully pushed.',
    type: CreatedProposalDto,
  })
  updateProposal(@Body() proposal: UpdatedProposalDto) {
    return this.proposalUpdateService.updateProposal(proposal);
  }

  @Post('executed-proposals')
  @ApiResponse({
    status: 200,
    description: 'Executed proposals have been fetched and pushed.',
  })
  async pushExecutedProposals() {
    try {
      const executedProposals =
        await this.proposalUpdateService.getProposalsExecuted();
      for (const proposal of executedProposals) {
        await this.proposalUpdateService.placeProposal(proposal);
      }
      return { message: 'Executed proposals have been fetched and pushed.' };
    } catch (error) {
      this.logger.error('Error pushing executed proposals:', error);
      throw error;
    }
  }

  @Post('canceled-proposals')
  @ApiResponse({
    status: 200,
    description: 'Canceled proposals have been fetched and pushed.',
  })
  async pushCanceledProposals() {
    try {
      const canceledProposals =
        await this.proposalUpdateService.getProposalsCanceled();
      for (const proposal of canceledProposals) {
        await this.proposalUpdateService.placeProposal(proposal);
      }
      return { message: 'Canceled proposals have been fetched and pushed.' };
    } catch (error) {
      this.logger.error('Error pushing canceled proposals:', error);
      throw error;
    }
  }
}

