import { Injectable } from '@nestjs/common';
import { CreateExchangeUserDto } from './dto/create-exchange_user.dto';
import { UpdateExchangeUserDto } from './dto/update-exchange_user.dto';

@Injectable()
export class ExchangeUserService {
  create(createExchangeUserDto: CreateExchangeUserDto) {
    return 'This action adds a new exchangeUser';
  }

  findAll() {
    return `This action returns all exchangeUser`;
  }

  findOne(id: number) {
    return `This action returns a #${id} exchangeUser`;
  }

  update(id: number, updateExchangeUserDto: UpdateExchangeUserDto) {
    return `This action updates a #${id} exchangeUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} exchangeUser`;
  }
}
