import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MfsBusiness } from './entities/mfs_business.entity';

@Injectable()
export class MfsBusinessService {
  constructor(
    @InjectRepository(MfsBusiness)
    private readonly mfsBusinessRepository: Repository<MfsBusiness>,
  ) {}

  async create(
    mfs_business: Partial<MfsBusiness>,
    user_id: number,
  ): Promise<MfsBusiness> {
    // const user = await this.authenticationRepository.findOne({
    //   where: { id: user_id },
    // });
    // if (!user) {
    //   throw new Error('User not found'); 
    // }
    const new_mfs_business = this.mfsBusinessRepository.create(mfs_business);
    return this.mfsBusinessRepository.save({ ...new_mfs_business,  });
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

  async findByOrgName(
    org_name: string,
    sub: string,
  ): Promise<MfsBusiness> {
    // const role = await this.roleChecker.findOne(sub);
    // if (role != 'MFS') {
    //   throw new UnauthorizedException();
    // }
    return this.mfsBusinessRepository.findOne({ where: { org_name } });
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
