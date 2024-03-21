import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeUserEntity } from './entities/exchange_user.entity';

@Injectable()
export class ExchangeUserService {
  constructor(@InjectRepository(ExchangeUserEntity) private exchangeUserRepository: Repository<ExchangeUserEntity>) { }

  async create(exchange_user: Partial<ExchangeUserEntity>): Promise<ExchangeUserEntity> {
    const new_user = this.exchangeUserRepository.create(exchange_user);
    return this.exchangeUserRepository.save(new_user);
  }

  async findAll(): Promise<ExchangeUserEntity[]> {
    return this.exchangeUserRepository.find();
  }

  async findOne(id: number): Promise<ExchangeUserEntity> {
    return this.exchangeUserRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<ExchangeUserEntity> {
    return this.exchangeUserRepository.findOne({ where: { email } });
  }

  async update(id: number, exchange_user: Partial<ExchangeUserEntity>): Promise<ExchangeUserEntity> {
    await this.exchangeUserRepository.update(id, exchange_user);
    return this.exchangeUserRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<string> {
    await this.exchangeUserRepository.delete(id);
    return `Removed #${id} exchangeUser`;
  }
}
