import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticationEntity } from './entities/authentication.entity';

@Injectable()
export class AuthenticationService {
  constructor(@InjectRepository(AuthenticationEntity) private authenticationRepository: Repository<AuthenticationEntity>) { }

  async create(authenticationEntity: AuthenticationEntity): Promise<AuthenticationEntity> {
    const new_user = this.authenticationRepository.create(authenticationEntity);
    return this.authenticationRepository.save(new_user);
  }

  async findOne(sub: string): Promise<string> {
    const user = await this.authenticationRepository.findOne({ where: { sub } });
    return user.role;
  }
}
