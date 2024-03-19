import { PartialType } from '@nestjs/mapped-types';
import { CreateExchangeUserDto } from './create-exchange_user.dto';

export class UpdateExchangeUserDto extends PartialType(CreateExchangeUserDto) {}
