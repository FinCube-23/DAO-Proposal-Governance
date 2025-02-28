import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  ValidateAuthorizationDto,
  MessageResponse,
} from './dto/validate-authorization.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @MessagePattern('validate-authorization')
  async getProposal(
    @Payload() data_packet: ValidateAuthorizationDto,
    @Ctx() context: RmqContext,
  ): Promise<MessageResponse> {
    return await this.authService.handleValidateAuthorization(data_packet, context);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
