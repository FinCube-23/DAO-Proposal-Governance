import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProposalUpdateService } from './proposal-update.service';
import {
  CreatedProposalDto,
  MessageEnvelopeDto,
  PendingTransactionDto,
  MessageResponse
} from './dto/proposal-update.dto';
import { Logger } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Ctx, RmqContext, MessagePattern, Payload } from '@nestjs/microservices';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';
import { text } from 'stream/consumers';


@Controller('proposal-update')
export class ProposalUpdateController {
  private readonly logger = new Logger(ProposalUpdateController.name);
  constructor(private readonly proposalUpdateService: ProposalUpdateService) { }

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
    type: ResponseTransactionStatusDto,
  })
  async placeProposal(@Body() proposal: ResponseTransactionStatusDto) {
    return await this.proposalUpdateService.updateProposal(proposal);
  }

}

