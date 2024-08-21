import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DAOEntity } from './entities/dao.entity';
import axios from 'axios';
@Injectable()
export class VotingService {
  private readonly logger = new Logger(VotingService.name);
  constructor(
    @InjectRepository(DAOEntity) private daoRepository: Repository<DAOEntity>) 
   { }

  private async getUserRole(sub: string): Promise<string> {
    try {
      const response = await axios.get(`http://user_management_api:3000/authentication/${sub}`);
      return response.data;
    } catch (error) {
      this.logger.error("Role of user not found");
      throw new UnauthorizedException("Role of user not found");;
    }
  }

  async create(sub: string, dao: Partial<DAOEntity>): Promise<DAOEntity> {
    const role = await this.getUserRole(sub);
    if (role != 'MFS') {
      this.logger.error("User does not have permission "+ role);
      throw new UnauthorizedException("User does not have permission");
    }
    const new_dao = this.daoRepository.create(dao);
    return this.daoRepository.save(new_dao);
  }

  async findOne(sub: string, id: number): Promise<DAOEntity> {
    const role = await this.getUserRole(sub);
    if (role != 'MFS') {
      this.logger.error("User does not have permission "+ role);
      throw new UnauthorizedException("User does not have permission");
    }
    return this.daoRepository.findOne({ where: { id } });
  }

  async update(sub: string,
    id: number,
    updated_dao: Partial<DAOEntity>,
  ): Promise<DAOEntity> {
    const role = await this.getUserRole(sub);
    if (role != 'MFS') {
      this.logger.error("User does not have permission "+ role);
      throw new UnauthorizedException("User does not have permission");
    }
    await this.daoRepository.update(id, updated_dao);
    return this.daoRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<string> {
    await this.daoRepository.delete(id);
    return `Removed #${id} DAO`;
  }
}
