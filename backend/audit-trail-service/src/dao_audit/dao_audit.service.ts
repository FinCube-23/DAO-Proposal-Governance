import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DaoAudit } from "./entities/dao_audit.entity";
@Injectable()
export class DaoAuditService {
  constructor(
    @InjectRepository(DaoAudit) private daoAuditRepository: Repository<DaoAudit>,
  ) { }
  create(createDaoAudit: DaoAudit) {
    const new_dao_audit = this.daoAuditRepository.create(createDaoAudit);
    return this.daoAuditRepository.save(new_dao_audit);
  }

  findAll() {
    return this.daoAuditRepository.find();
  }

  findOne(id: number) {
    return this.daoAuditRepository.findOne({ where: { id } });
  }

}
