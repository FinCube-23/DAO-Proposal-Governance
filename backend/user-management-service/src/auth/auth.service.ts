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
  ) { }

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
    const { access_token: token, options } = data_packet;
    console.log('payload', data_packet);
    const buildResponse = (
      status: 'SUCCESS' | 'FAILED',
      message: string,
      db_record_id = 0,
    ): MessageResponse => ({
      status,
      message_id: token || 'unknown',
      timestamp: new Date().toISOString(),
      data: {
        db_record_id,
        current_status: status === 'SUCCESS' ? 'VALIDATED' : 'UNKNOWN',
      },
      ...(status === 'FAILED' && {
        error: {
          code: 'PROCESSING_ERROR',
          message,
          details: { access_token: token, options },
        },
      }),
    });

    if (!token) {
      this.logger.error('Error processing pending proposal: No token found', {
        token,
        options,
      });
      return buildResponse('FAILED', 'No token found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      console.log('payload', payload);

      const user = await this.usersService.findOne(payload.email);
      console.log('user', user);
      this.logger.log(
        `Replying to Service: ${context.getMessage().properties.replyTo}`,
      );

      return buildResponse('SUCCESS', 'Validation successful', user.id);
    } catch (error) {
      this.logger.error('Error processing pending proposal:', {
        message: error.message,
        stack: error.stack,
        token,
        options,
      });
      return buildResponse('FAILED', error.message);
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
