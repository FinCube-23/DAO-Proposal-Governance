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
@Controller('dao-audit')
export class DaoAuditController {
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
    console.log(blockTimestamp_gt);
    if (blockTimestamp_gt) {
      return this.daoAuditService.getMembersRegistered(blockTimestamp_gt);
    } else {
      return 'Transaction hash error';
    }
  }
}
