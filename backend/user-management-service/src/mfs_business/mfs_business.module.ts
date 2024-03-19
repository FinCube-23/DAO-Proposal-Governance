import { Module } from '@nestjs/common';
import { MfsBusinessService } from './mfs_business.service';
import { MfsBusinessController } from './mfs_business.controller';

@Module({
  controllers: [MfsBusinessController],
  providers: [MfsBusinessService],
})
export class MfsBusinessModule {}
