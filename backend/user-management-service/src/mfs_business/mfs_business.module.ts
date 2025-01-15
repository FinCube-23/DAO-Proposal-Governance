import { Module } from '@nestjs/common';
import { MfsBusinessService } from './mfs_business.service';
import { MfsBusinessController } from './mfs_business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MfsBusiness } from 'src/mfs_business/entities/mfs_business.entity';
import { UsersModule } from 'src/users/users.module';
@Module({
  imports: [TypeOrmModule.forFeature([MfsBusiness]), UsersModule],
  controllers: [MfsBusinessController],
  providers: [MfsBusinessService]
})
export class MfsBusinessModule {}
