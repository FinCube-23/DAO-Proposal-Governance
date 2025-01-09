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
  MessageEnvelopeDto,
  PendingTransactionDto,
  MessageResponse
} from './dto/proposal-update.dto';
import { Logger } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { Ctx, RmqContext, MessagePattern, Payload } from '@nestjs/microservices';


@Controller('proposal-update')
export class ProposalUpdateController {
  private readonly logger = new Logger(ProposalUpdateController.name);
  constructor(private readonly proposalUpdateService: ProposalUpdateService) { }

  @Get('get-proposals')
  getProposals() {
    return this.proposalUpdateService.getUpdatedProposals();
  }

  // 📡 MessagePattern expects a response, Not like Fire and Forget model | This is a Consumer
  @MessagePattern('queue-pending-proposal')
  async getProposal(@Payload() data_packet: PendingTransactionDto, @Ctx() context: RmqContext): Promise<MessageResponse> {
    return await this.proposalUpdateService.handlePendingProposal(data_packet, context);
  }

  // 💬 Pushing Event in the Message Queue in EventPattern (No response expected) | This is Publisher
  @Post('create-proposal')
  @ApiBody({ type: CreatedProposalDto })
  @ApiResponse({
    status: 200,
    description: 'The message has been successfully pushed.',
    type: CreatedProposalDto,
  })
  async placeProposal(@Body() proposal: CreatedProposalDto) {
    return await this.proposalUpdateService.updateProposal(proposal);
  }

}

