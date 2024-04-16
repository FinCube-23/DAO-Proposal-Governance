import { PartialType } from '@nestjs/mapped-types';
import { CreateDaoAuditDto } from './create-dao_audit.dto';

export class UpdateDaoAuditDto extends PartialType(CreateDaoAuditDto) {}
