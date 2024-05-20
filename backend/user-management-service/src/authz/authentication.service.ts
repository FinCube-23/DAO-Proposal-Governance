import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticationEntity } from './entities/authentication.entity';
import { EncryptionService } from './encryption.service';

@Injectable()
export class AuthenticationService {
  constructor(@InjectRepository(AuthenticationEntity) private authenticationRepository: Repository<AuthenticationEntity>, private readonly encryptionService: EncryptionService) { }

  async create(authenticationEntity: AuthenticationEntity, secret: string): Promise<AuthenticationEntity> {
    if (!this.encryptionService.match(secret)) {
      throw new UnauthorizedException;
    }
    const new_user = this.authenticationRepository.create(authenticationEntity);
    return this.authenticationRepository.save(new_user);
  }

  async findOne(sub: string): Promise<string> {
    const user = await this.authenticationRepository.findOne({ where: { sub } });
    return user.role;
  }
}
