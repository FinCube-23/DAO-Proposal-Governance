import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticationEntity } from './entities/authentication.entity';
import { EncryptionService } from './encryption.service';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);
  constructor(
    @InjectRepository(AuthenticationEntity)
    private authenticationRepository: Repository<AuthenticationEntity>,
    private readonly encryptionService: EncryptionService
  ) { }

  async create(
    authenticationEntity: AuthenticationEntity,
    secret: string,
  ): Promise<AuthenticationEntity> {
    if (!this.encryptionService.match(secret)) {
      this.logger.error("Invalid secret key");
      throw new UnauthorizedException();
    }
    const new_user = this.authenticationRepository.create(authenticationEntity);
    return this.authenticationRepository.save(new_user);
  }

  async findOne(sub: string): Promise<string> {
    const user = await this.authenticationRepository.findOne({
      where: { sub },
    });
    return user.role;
  }

  async me(sub: string): Promise<any> {
    const user = await this.authenticationRepository.findOne({
      where: { sub }
    });
    return user;
  }

  async registerId(sub: string, id: number): Promise<any> {
    const user = await this.authenticationRepository.findOne({
      where: { sub },
    });
    try {
      user.id = id;

      await this.authenticationRepository.save(user);

      return user;
    } catch (error) {
      throw new UnauthorizedException("User not found")
    }
  }
}
