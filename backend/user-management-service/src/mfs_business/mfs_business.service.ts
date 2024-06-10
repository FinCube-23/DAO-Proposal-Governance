import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MfsBusinessEntity } from './entities/mfs_business.entity';
import { RoleChecker } from 'src/authz/rolechecker.service';
import { AuthenticationEntity } from 'src/authz/entities/authentication.entity';

@Injectable()
export class MfsBusinessService {
  constructor(
    @InjectRepository(MfsBusinessEntity)
    private readonly mfsBusinessRepository: Repository<MfsBusinessEntity>,
    @InjectRepository(AuthenticationEntity)
    private authenticationRepository: Repository<AuthenticationEntity>,
    private readonly roleChecker: RoleChecker, // Corrected the name here
  ) {}

  async create(
    mfs_business: Partial<MfsBusinessEntity>,
    user_id: number,
  ): Promise<MfsBusinessEntity> {
    const user = await this.authenticationRepository.findOne({
      where: { id: user_id },
    });
    if (!user) {
      throw new Error('User not found'); // Handle this appropriately in your application
    }
    const new_mfs_business = this.mfsBusinessRepository.create(mfs_business);
    return this.mfsBusinessRepository.save({ ...new_mfs_business, user });
  }

  async findAll(sub: string): Promise<MfsBusinessEntity[]> {
    const role = await this.roleChecker.findOne(sub);
    if (role != 'MFS') {
      throw new UnauthorizedException();
    }
    return this.mfsBusinessRepository.find();
  }

  async findOne(id: number, sub: string): Promise<MfsBusinessEntity> {
    const role = await this.roleChecker.findOne(sub);
    if (role != 'MFS') {
      throw new UnauthorizedException();
    }
    return this.mfsBusinessRepository.findOne({ where: { id } });
  }

  async findByEmail(
    org_email: string,
    sub: string,
  ): Promise<MfsBusinessEntity> {
    const role = await this.roleChecker.findOne(sub);
    if (role != 'MFS') {
      throw new UnauthorizedException();
    }
    return this.mfsBusinessRepository.findOne({ where: { org_email } });
  }

  async update(
    id: number,
    exchange_user: Partial<MfsBusinessEntity>,
    sub: string,
  ): Promise<MfsBusinessEntity> {
    const role = await this.roleChecker.findOne(sub);
    if (role != 'MFS') {
      throw new UnauthorizedException();
    }
    await this.mfsBusinessRepository.update(id, exchange_user);
    return this.mfsBusinessRepository.findOne({ where: { id } });
  }

  async remove(id: number, sub: string): Promise<string> {
    const role = await this.roleChecker.findOne(sub);
    if (role != 'MFS') {
      throw new UnauthorizedException();
    }
    await this.mfsBusinessRepository.delete(id);
    return `Removed #${id} MFS Business`;
  }
}
