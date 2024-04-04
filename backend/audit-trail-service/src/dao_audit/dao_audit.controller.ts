import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DaoAuditService } from './dao_audit.service';
import { CreateDaoAuditDto } from './dto/create-dao_audit.dto';
import { UpdateDaoAuditDto } from './dto/update-dao_audit.dto';

@Controller('dao-audit')
export class DaoAuditController {
  constructor(private readonly daoAuditService: DaoAuditService) {}

  @Post()
  create(@Body() createDaoAuditDto: CreateDaoAuditDto) {
    return this.daoAuditService.create(createDaoAuditDto);
  }

  @Get()
  findAll() {
    return this.daoAuditService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.daoAuditService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDaoAuditDto: UpdateDaoAuditDto) {
    return this.daoAuditService.update(+id, updateDaoAuditDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.daoAuditService.remove(+id);
  }
}
