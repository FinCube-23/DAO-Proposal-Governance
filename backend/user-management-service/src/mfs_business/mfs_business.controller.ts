import { Controller, Get, Post, Body, Put, Param, Delete, NotFoundException } from '@nestjs/common';
import { MfsBusinessService } from './mfs_business.service';

import { MfsBusinessEntity } from './entities/mfs_business.entity';

@Controller('mfs-business')
export class MfsBusinessController {
  constructor(private readonly mfsBusinessService: MfsBusinessService) { }

  @Post()
  async create(@Body() mfs_business_entity: MfsBusinessEntity): Promise<MfsBusinessEntity> {
    return this.mfsBusinessService.create(mfs_business_entity);
  }

  @Post()
  async findByEmail(@Body() email: string): Promise<MfsBusinessEntity> {
    const mfs_business = await this.mfsBusinessService.findByEmail(email);
    if (!mfs_business) {
      throw new NotFoundException('MFS business not found');
    } else {
      return mfs_business;
    }
  }

  @Get()
  async findAll(): Promise<MfsBusinessEntity[]> {
    return this.mfsBusinessService.findAll();
  }


  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MfsBusinessEntity> {
    const mfs_business = await this.mfsBusinessService.findOne(+id);
    if (!mfs_business) {
      throw new NotFoundException(`MFS business doesn't exist`);
    } else {
      return mfs_business;
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() mfs_business_entity: MfsBusinessEntity): Promise<MfsBusinessEntity> {
    return this.mfsBusinessService.update(+id, mfs_business_entity);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<any> {
    const mfs_business = await this.mfsBusinessService.findOne(+id);
    if (!mfs_business) {
      throw new NotFoundException(`MFS business doesn't exist`);
    } else {
      return this.mfsBusinessService.remove(+id);
    }
  }
}
