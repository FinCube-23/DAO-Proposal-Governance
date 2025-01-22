import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MfsBusiness } from './entities/mfs_business.entity';
import { MfsBusinessDTO } from './dtos/MfsBusinessDto';

@Injectable()
export class MfsBusinessService {
  constructor(
    @InjectRepository(MfsBusiness)
    private readonly mfsBusinessRepository: Repository<MfsBusiness>,
  ) {}

  async create(
    mfs_business: MfsBusiness,
  ): Promise<MfsBusinessDTO> {
    const {user, ...mfsInfo} = await this.mfsBusinessRepository.save(mfs_business);
    return mfsInfo;
  }

  async findAll(sub: string): Promise<MfsBusiness[]> {
    // const role = await this.roleChecker.findOne(sub);
    // if (role != 'MFS') {
    //   throw new UnauthorizedException();
    // }
    return this.mfsBusinessRepository.find();
  }

  async findOne(id: number, sub: string): Promise<MfsBusiness> {
    // const role = await this.roleChecker.findOne(sub);
    // if (role != 'MFS') {
    //   throw new UnauthorizedException();
    // }
    return this.mfsBusinessRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<MfsBusiness> {
    // const role = await this.roleChecker.findOne(sub);
    // if (role != 'MFS') {
    //   throw new UnauthorizedException();
    // }
    return this.mfsBusinessRepository.findOne({ where: { email } });
  }

  async update(
    id: number,
    exchange_user: Partial<MfsBusiness>,
    sub: string,
  ): Promise<MfsBusiness> {
    // const role = await this.roleChecker.findOne(sub);
    // if (role != 'MFS') {
    //   throw new UnauthorizedException();
    // }
    await this.mfsBusinessRepository.update(id, exchange_user);
    return this.mfsBusinessRepository.findOne({ where: { id } });
  }

  async remove(id: number, sub: string): Promise<string> {
    // const role = await this.roleChecker.findOne(sub);
    // if (role != 'MFS') {
    //   throw new UnauthorizedException();
    // }
    await this.mfsBusinessRepository.delete(id);
    return `Removed #${id} MFS Business`;
  }
}
