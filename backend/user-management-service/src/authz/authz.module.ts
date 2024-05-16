import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationEntity } from './entities/authentication.entity';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
@Module({
    imports: [PassportModule.register({ defaultStrategy: 'jwt' }), TypeOrmModule.forFeature([AuthenticationEntity])],
    controllers: [AuthenticationController],
    providers: [JwtStrategy, AuthenticationService],
    exports: [PassportModule],
})
export class AuthzModule { }
