import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import {
  ValidateAuthorizationDto,
  MessageResponse,
} from './dto/validate-authorization.dto';
import { Ctx, RmqContext } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User does not exists');
    }
    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Crentials');
    }
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async handleValidateAuthorization(
    data_packet: ValidateAuthorizationDto,
    @Ctx() context: RmqContext,
  ): Promise<MessageResponse> {
    const token = data_packet.access_token;
    if (!token) {
      this.logger.error('Error processing pending proposal:', {
        error: 'No token found',
        access_token: data_packet?.access_token,
        options: data_packet?.options,
      });
      return {
        status: 'FAILED',
        message_id: data_packet?.access_token || 'unknown',
        timestamp: new Date().toISOString(),
        data: {
          db_record_id: 0,
          current_status: 'UNKNOWN',
        },
        error: {
          code: 'PROCESSING_ERROR',
          message: 'No token found',
          details: {
            access_token: data_packet?.access_token,
            options: data_packet?.options,
          },
        },
      };
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.usersService.findOne(payload.email);

      const originalMsg = context.getMessage();
      const replyTo = originalMsg.properties.replyTo;
      this.logger.log('Replying to Service: ' + replyTo);

      return {
        status: 'SUCCESS',
        message_id: data_packet.access_token,
        timestamp: new Date().toISOString(),
        data: {
          db_record_id: user.id,
          current_status: 'VALIDATED',
        },
      };
    } catch (error) {
      this.logger.error('Error processing pending proposal:', {
        error: error.message,
        access_token: data_packet?.access_token,
        options: data_packet?.options,
      });
      return {
        status: 'FAILED',
        message_id: data_packet?.access_token || 'unknown',
        timestamp: new Date().toISOString(),
        data: {
          db_record_id: 0,
          current_status: 'UNKNOWN',
        },
        error: {
          code: 'PROCESSING_ERROR',
          message: error.message,
          details: {
            access_token: data_packet?.access_token,
            options: data_packet?.options,
          },
        },
      };
    }
  }

  async signUp(
    createUserDto: CreateUserDto,
  ): Promise<{ data: { message: string } }> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hash = await bcrypt.hash(createUserDto.password, 10);
    await this.usersService.create(
      new User({ ...createUserDto, password: hash }),
    );

    return {
      data: {
        message: 'User created successfully',
      },
    };
  }
}
