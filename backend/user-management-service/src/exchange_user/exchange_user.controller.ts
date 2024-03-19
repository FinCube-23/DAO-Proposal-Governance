import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExchangeUserService } from './exchange_user.service';
import { CreateExchangeUserDto } from './dto/create-exchange_user.dto';
import { UpdateExchangeUserDto } from './dto/update-exchange_user.dto';

@Controller('exchange-user')
export class ExchangeUserController {
  constructor(private readonly exchangeUserService: ExchangeUserService) {}

  @Post()
  create(@Body() createExchangeUserDto: CreateExchangeUserDto) {
    return this.exchangeUserService.create(createExchangeUserDto);
  }

  @Get()
  findAll() {
    return this.exchangeUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exchangeUserService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExchangeUserDto: UpdateExchangeUserDto) {
    return this.exchangeUserService.update(+id, updateExchangeUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exchangeUserService.remove(+id);
  }
}
