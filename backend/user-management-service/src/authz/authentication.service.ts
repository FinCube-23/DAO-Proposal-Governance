import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticationEntity } from './entities/authentication.entity';
import { EncryptionService } from './encryption.service';
// import { MfsBusinessEntity } from '../mfs_business/entities/mfs_business.entity';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);
  constructor(
    @InjectRepository(AuthenticationEntity)
    private authenticationRepository: Repository<AuthenticationEntity>,
    private readonly encryptionService: EncryptionService,
    // private readonly mfsBusinessRepository: Repository<MfsBusinessEntity>,
  ) {}

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
      where: { sub },
      relations: {
        mfs: true,
      },
    });

    // if (user.role === 'MFS') {
    //   const mfs = await this.mfsBusinessRepository.findOne({
    //     where: { org_email: user.email },})
    // }
    return user;
  }
}
