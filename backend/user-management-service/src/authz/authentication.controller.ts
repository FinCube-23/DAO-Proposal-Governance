/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationEntity } from './entities/authentication.entity';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

@Controller('authentication')
@ApiBearerAuth()
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) { }

  @Post()
  @ApiBody({ type: AuthenticationEntity })
  async create(@Req() req, @Body() authenticationEntity: AuthenticationEntity): Promise<AuthenticationEntity> {
    return this.authenticationService.create(authenticationEntity, req.body.secret);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Req() req): Promise<any> {
    return this.authenticationService.me(req.user);
  }

  @Get(':sub')
  async findRole(@Param('sub') sub: string): Promise<string> {
    return this.authenticationService.findOne(sub);
  }

  @Post('register-id')
  @ApiBody({ type: AuthenticationEntity })
  async registerId(@Req() req, @Body() authenticationEntity: AuthenticationEntity): Promise<AuthenticationEntity> {
    return this.authenticationService.registerId(req.user, req.body.id);
  }
}
