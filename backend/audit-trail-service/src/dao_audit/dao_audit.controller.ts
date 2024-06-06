import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DaoAuditService } from './dao_audit.service';
import { DaoAudit } from './entities/dao_audit.entity';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Logger } from '@nestjs/common';

import { ProposalDto } from './dto/proposal.dto';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller('dao-audit')
export class DaoAuditController {
  private readonly logger = new Logger(DaoAuditController.name);

  constructor(private readonly daoAuditService: DaoAuditService) {}

  @Post()
  @ApiBody({ type: DaoAudit })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully created.',
    type: DaoAudit,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  create(@Body() daoAudit: DaoAudit): Promise<DaoAudit> {
    this.logger.log(
      `Creating new DAO audit entry: ${JSON.stringify(daoAudit)}`,
    );
    return this.daoAuditService.create(daoAudit);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: DaoAudit,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  findAll(): Promise<DaoAudit[]> {
    this.logger.log('Fetching all DAO audit entries');
    return this.daoAuditService.findAll();
  }

  @Get('member-register/:blockTimestamp_gt')
  @ApiResponse({
    status: 200,
    description:
      'The member registered records have been successfully retrieved.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async getMembersRegistered(
    @Param('blockTimestamp_gt') blockTimestamp_gt: string,
  ): Promise<any> {
    if (blockTimestamp_gt) {
      this.logger.log(
        `Fetching registered members after block timestamp: ${blockTimestamp_gt}`,
      );
      return this.daoAuditService.getMembersRegistered(blockTimestamp_gt);
    } else {
      this.logger.warn('Transaction hash error');
      return 'Transaction hash error';
    }
  }

  @EventPattern('proposal-placed')
  handleProposalPlaced(@Payload() proposal: ProposalDto) {
    return this.daoAuditService.handleProposalPlaced(proposal);
  }

  @MessagePattern({ cmd: 'fetch-proposal' })
  getProposal(@Ctx() context: RmqContext) {
    this.logger.log(
      `Message Queue:`, context.getMessage()
    );
    return this.daoAuditService.getProposals();
  }

}
