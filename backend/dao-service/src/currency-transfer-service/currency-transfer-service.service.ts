import { Injectable } from '@nestjs/common';
import { CreateCurrencyTransferServiceDto } from './dto/create-currency-transfer-service.dto';
import { UpdateCurrencyTransferServiceDto } from './dto/update-currency-transfer-service.dto';

@Injectable()
export class CurrencyTransferServiceService {
  create(createCurrencyTransferServiceDto: CreateCurrencyTransferServiceDto) {
    return 'This action adds a new currencyTransferService';
  }

  findAll() {
    return `This action returns all currencyTransferService`;
  }

  findOne(id: number) {
    return `This action returns a #${id} currencyTransferService`;
  }

  update(id: number, updateCurrencyTransferServiceDto: UpdateCurrencyTransferServiceDto) {
    return `This action updates a #${id} currencyTransferService`;
  }

  remove(id: number) {
    return `This action removes a #${id} currencyTransferService`;
  }
}
