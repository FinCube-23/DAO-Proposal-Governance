import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationEntity } from './entities/authentication.entity';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { EncryptionService } from './encryption.service';
import { RoleChecker } from './rolechecker.service';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([AuthenticationEntity]),
  ],
  controllers: [AuthenticationController],
  providers: [
    JwtStrategy,
    AuthenticationService,
    EncryptionService,
    RoleChecker,
  ],
  exports: [PassportModule, RoleChecker, TypeOrmModule],
})
export class AuthzModule {}
