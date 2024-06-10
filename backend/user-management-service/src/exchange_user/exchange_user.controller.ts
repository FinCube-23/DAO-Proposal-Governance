import { Controller, Get, Post, Body, Put, Param, Delete, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { ExchangeUserService } from './exchange_user.service';
import { ExchangeUserEntity } from './entities/exchange_user.entity';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('exchange-user')
export class ExchangeUserController {
  constructor(private readonly exchangeUserService: ExchangeUserService) { }

  @Post()
  @ApiBody({ type: ExchangeUserEntity })
  @ApiResponse({ status: 200, description: 'The record has been successfully created.', type: ExchangeUserEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() exchange_user_entity: ExchangeUserEntity): Promise<ExchangeUserEntity> {
    return this.exchangeUserService.create(exchange_user_entity);
  }

  // @Post()
  // async findByEmail(@Body() email: string): Promise<ExchangeUserEntity> {
  //   const exchange_user = await this.exchangeUserService.findByEmail(email);
  //   if (!exchange_user) {
  //     throw new NotFoundException('exchange_user not found');
  //   } else {
  //     return exchange_user;
  //   }
  // }

  @Get()
  @ApiResponse({ status: 200, type: [ExchangeUserEntity] })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req): Promise<ExchangeUserEntity[]> {
    return this.exchangeUserService.findAll(req.user);
  }


  @Get(':id')
  @ApiResponse({ status: 200, type: ExchangeUserEntity })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string, @Req() req): Promise<ExchangeUserEntity> {
    const exchange_user = await this.exchangeUserService.findOne(+id, req.user);
    if (!exchange_user) {
      throw new NotFoundException(`Exchange user doesn't exist`);
    } else {
      return exchange_user;
    }
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'The record has been successfully updated.', type: ExchangeUserEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() exchange_user_entity: ExchangeUserEntity, @Req() req): Promise<ExchangeUserEntity> {
    return this.exchangeUserService.update(+id, exchange_user_entity, req.user);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'The record has been successfully deleted.', type: ExchangeUserEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string, @Req() req): Promise<any> {
    const exchange_user = await this.exchangeUserService.findOne(+id, req.user);
    if (!exchange_user) {
      throw new NotFoundException(`Exchange user doesn't exist`);
    } else {
      return this.exchangeUserService.remove(+id, req.user);
    }
  }
}
