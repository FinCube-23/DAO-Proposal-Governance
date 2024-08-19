import { Module } from '@nestjs/common';
import { MfsBusinessService } from './mfs_business.service';
import { MfsBusinessController } from './mfs_business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MfsBusinessEntity } from 'src/mfs_business/entities/mfs_business.entity';
import { AuthzModule } from 'src/authz/authz.module';

@Module({
  imports: [TypeOrmModule.forFeature([MfsBusinessEntity]), AuthzModule],
  controllers: [MfsBusinessController],
  providers: [MfsBusinessService],
})
export class MfsBusinessModule {}
