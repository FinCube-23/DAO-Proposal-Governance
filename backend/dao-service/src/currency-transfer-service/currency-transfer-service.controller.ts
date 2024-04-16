import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,} from '@nestjs/common';
import { CurrencyTransferServiceService } from './currency-transfer-service.service';
import { CreateCurrencyTransferServiceDto } from './dto/create-currency-transfer-service.dto';
import { UpdateCurrencyTransferServiceDto } from './dto/update-currency-transfer-service.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('currency-transfer-service')
export class CurrencyTransferServiceController {
  constructor(private readonly currencyTransferServiceService: CurrencyTransferServiceService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createCurrencyTransferServiceDto: CreateCurrencyTransferServiceDto) {
    return this.currencyTransferServiceService.create(createCurrencyTransferServiceDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.currencyTransferServiceService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.currencyTransferServiceService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateCurrencyTransferServiceDto: UpdateCurrencyTransferServiceDto) {
    return this.currencyTransferServiceService.update(+id, updateCurrencyTransferServiceDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.currencyTransferServiceService.remove(+id);
  }
}
