import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationEntity } from './entities/authentication.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) { }

  @Post()
  async create(@Req() req, @Body() authenticationEntity: AuthenticationEntity): Promise<AuthenticationEntity> {
    return this.authenticationService.create(authenticationEntity, req.body.secret);
  }

  @Get(':sub')
  async findRole(@Param('sub') sub: string): Promise<string> {
    return this.authenticationService.findOne(sub);
  }
}
