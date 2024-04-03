import { Module } from '@nestjs/common';
import { DaoAuditService } from './dao_audit.service';
import { DaoAuditController } from './dao_audit.controller';

@Module({
  controllers: [DaoAuditController],
  providers: [DaoAuditService],
})
export class DaoAuditModule {}
