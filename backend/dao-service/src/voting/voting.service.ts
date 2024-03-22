import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DAOEntity } from './entities/dao.entity';

@Injectable()
export class VotingService {
  constructor(@InjectRepository(DAOEntity) private daoRepository: Repository<DAOEntity>) { }

  async create(dao: Partial<DAOEntity>): Promise<DAOEntity> {
    const new_dao = this.daoRepository.create(dao);
    return this.daoRepository.save(new_dao);
  }

  async findOne(id: number): Promise<DAOEntity> {
    return this.daoRepository.findOne({ where: { id } });
  }

  async update(id: number, updated_dao: Partial<DAOEntity>): Promise<DAOEntity> {
    await this.daoRepository.update(id, updated_dao);
    return this.daoRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<string> {
    await this.daoRepository.delete(id);
    return `Removed #${id} DAO`;
  }
}
