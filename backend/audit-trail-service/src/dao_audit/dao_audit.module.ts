import { Module } from '@nestjs/common';
import { DaoAuditService } from './dao_audit.service';
import { DaoAuditController } from './dao_audit.controller';
import { DaoAudit } from './entities/dao_audit.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [DaoAuditController],
  providers: [DaoAuditService],
  imports: [TypeOrmModule.forFeature([DaoAudit])],
})
export class DaoAuditModule {}
