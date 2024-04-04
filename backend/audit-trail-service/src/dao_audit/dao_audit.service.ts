import { Injectable } from '@nestjs/common';
import { CreateDaoAuditDto } from './dto/create-dao_audit.dto';
import { UpdateDaoAuditDto } from './dto/update-dao_audit.dto';

@Injectable()
export class DaoAuditService {
  create(createDaoAuditDto: CreateDaoAuditDto) {
    return 'This action adds a new daoAudit';
  }

  findAll() {
    return `This action returns all daoAudit`;
  }

  findOne(id: number) {
    return `This action returns a #${id} daoAudit`;
  }

  update(id: number, updateDaoAuditDto: UpdateDaoAuditDto) {
    return `This action updates a #${id} daoAudit`;
  }

  remove(id: number) {
    return `This action removes a #${id} daoAudit`;
  }
}
