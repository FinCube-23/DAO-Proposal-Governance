import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MfsBusinessEntity } from './entities/mfs_business.entity';

@Injectable()
export class MfsBusinessService {
  constructor(@InjectRepository(MfsBusinessEntity) private mfsBusinessRepository: Repository<MfsBusinessEntity>) { }

  async create(mfs_business: Partial<MfsBusinessEntity>, sub: string): Promise<MfsBusinessEntity> {
    if (sub !== 'mfs_user') {
      throw new UnauthorizedException;
    }

    const new_mfs_business = this.mfsBusinessRepository.create(mfs_business);
    return this.mfsBusinessRepository.save(new_mfs_business);
  }

  async findAll(): Promise<MfsBusinessEntity[]> {
    return this.mfsBusinessRepository.find();
  }

  async findOne(id: number): Promise<MfsBusinessEntity> {
    return this.mfsBusinessRepository.findOne({ where: { id } });
  }

  async findByEmail(org_email: string): Promise<MfsBusinessEntity> {
    return this.mfsBusinessRepository.findOne({ where: { org_email } });
  }

  async update(id: number, exchange_user: Partial<MfsBusinessEntity>): Promise<MfsBusinessEntity> {
    await this.mfsBusinessRepository.update(id, exchange_user);
    return this.mfsBusinessRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<string> {
    await this.mfsBusinessRepository.delete(id);
    return `Removed #${id} MFS Business`;
  }
}
