import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeUserEntity } from './entities/exchange_user.entity';
import { RoleChecker } from 'src/authz/rolechecker.service';
@Injectable()
export class ExchangeUserService {
  constructor(@InjectRepository(ExchangeUserEntity) private exchangeUserRepository: Repository<ExchangeUserEntity>, private readonly roleChecker: RoleChecker) { }

  async create(exchange_user: Partial<ExchangeUserEntity>): Promise<ExchangeUserEntity> {
    const new_user = this.exchangeUserRepository.create(exchange_user);
    return this.exchangeUserRepository.save(new_user);
  }

  async findAll(sub: string): Promise<ExchangeUserEntity[]> {
    const role = await this.roleChecker.findOne(sub);
    if (role != 'USER') {
      throw new UnauthorizedException();
    }
    return this.exchangeUserRepository.find();
  }

  async findOne(id: number, sub: string): Promise<ExchangeUserEntity> {
    const role = await this.roleChecker.findOne(sub);
    if (role != 'USER') {
      throw new UnauthorizedException();
    }
    return this.exchangeUserRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string, sub: string): Promise<ExchangeUserEntity> {
    const role = await this.roleChecker.findOne(sub);
    if (role != 'USER') {
      throw new UnauthorizedException();
    }
    return this.exchangeUserRepository.findOne({ where: { email } });
  }

  async update(id: number, exchange_user: Partial<ExchangeUserEntity>, sub: string): Promise<ExchangeUserEntity> {
    const role = await this.roleChecker.findOne(sub);
    if (role != 'USER') {
      throw new UnauthorizedException();
    }
    await this.exchangeUserRepository.update(id, exchange_user);
    return this.exchangeUserRepository.findOne({ where: { id } });
  }

  async remove(id: number, sub: string): Promise<string> {
    const role = await this.roleChecker.findOne(sub);
    if (role != 'USER') {
      throw new UnauthorizedException();
    }
    await this.exchangeUserRepository.delete(id);
    return `Removed #${id} exchangeUser`;
  }
}
