import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CurrencyTransferServiceService } from './currency-transfer-service.service';
import { CreateCurrencyTransferServiceDto } from './dto/create-currency-transfer-service.dto';
import { UpdateCurrencyTransferServiceDto } from './dto/update-currency-transfer-service.dto';

@Controller('currency-transfer-service')
export class CurrencyTransferServiceController {
  constructor(private readonly currencyTransferServiceService: CurrencyTransferServiceService) {}

  @Post()
  create(@Body() createCurrencyTransferServiceDto: CreateCurrencyTransferServiceDto) {
    return this.currencyTransferServiceService.create(createCurrencyTransferServiceDto);
  }

  @Get()
  findAll() {
    return this.currencyTransferServiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.currencyTransferServiceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCurrencyTransferServiceDto: UpdateCurrencyTransferServiceDto) {
    return this.currencyTransferServiceService.update(+id, updateCurrencyTransferServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.currencyTransferServiceService.remove(+id);
  }
}
