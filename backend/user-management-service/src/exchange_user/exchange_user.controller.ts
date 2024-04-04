import { Controller, Get, Post, Body, Put, Param, Delete, NotFoundException } from '@nestjs/common';
import { ExchangeUserService } from './exchange_user.service';
import { ExchangeUserEntity } from './entities/exchange_user.entity';
import { ApiBody } from '@nestjs/swagger';

@Controller('exchange-user')
export class ExchangeUserController {
  constructor(private readonly exchangeUserService: ExchangeUserService) { }

  @Post()
  @ApiBody({ type: ExchangeUserEntity })
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
  async findAll(): Promise<ExchangeUserEntity[]> {
    return this.exchangeUserService.findAll();
  }


  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ExchangeUserEntity> {
    const exchange_user = await this.exchangeUserService.findOne(+id);
    if (!exchange_user) {
      throw new NotFoundException(`Exchange user doesn't exist`);
    } else {
      return exchange_user;
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() exchange_user_entity: ExchangeUserEntity): Promise<ExchangeUserEntity> {
    return this.exchangeUserService.update(+id, exchange_user_entity);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<any> {
    const exchange_user = await this.exchangeUserService.findOne(+id);
    if (!exchange_user) {
      throw new NotFoundException(`Exchange user doesn't exist`);
    } else {
      return this.exchangeUserService.remove(+id);
    }
  }
}
