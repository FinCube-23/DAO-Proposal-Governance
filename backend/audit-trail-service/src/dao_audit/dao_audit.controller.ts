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
  create(@Body() daoAudit: DaoAudit) {
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
  findAll() {
    return this.daoAuditService.findAll();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: DaoAudit,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async getTransaction(@Query('transactionHash') transactionHash?: string) {
    if (transactionHash) {
      return this.daoAuditService.getTransaction(transactionHash);
    } else {
      return 0;
    }
  }
}
