import { Controller, Get, Post, Body, Put, Param, Delete, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { MfsBusinessService } from './mfs_business.service';
import { AuthGuard } from '@nestjs/passport';
import { MfsBusinessEntity } from './entities/mfs_business.entity';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('mfs-business')
export class MfsBusinessController {
  constructor(private readonly mfsBusinessService: MfsBusinessService) { }

  @Post()
  @ApiBody({ type: MfsBusinessEntity })
  @ApiResponse({ status: 200, description: 'The record has been successfully created.', type: MfsBusinessEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() mfs_business_entity: MfsBusinessEntity): Promise<MfsBusinessEntity> {

    return this.mfsBusinessService.create(mfs_business_entity);
  }
  //redundant api call
  // @Post()
  // @ApiBody({ type: String, description: "email" })
  // async findByEmail(@Body() email: string): Promise<MfsBusinessEntity> {
  //   const mfs_business = await this.mfsBusinessService.findByEmail(email);
  //   if (!mfs_business) {
  //     throw new NotFoundException('MFS business not found');
  //   } else {
  //     return mfs_business;
  //   }
  // }

  @Get()
  @ApiResponse({ status: 200, type: [MfsBusinessEntity] })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req): Promise<MfsBusinessEntity[]> {
    console.log(req.user);
    return this.mfsBusinessService.findAll(req.user);
  }


  @Get(':id')
  @ApiResponse({ status: 200, type: MfsBusinessEntity })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string, @Req() req): Promise<MfsBusinessEntity> {
    const mfs_business = await this.mfsBusinessService.findOne(+id, req.user);
    if (!mfs_business) {
      throw new NotFoundException(`MFS business doesn't exist`);
    } else {
      return mfs_business;
    }
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'The record has been successfully updated.', type: MfsBusinessEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() mfs_business_entity: MfsBusinessEntity, @Req() req): Promise<MfsBusinessEntity> {
    return this.mfsBusinessService.update(+id, mfs_business_entity, req.user);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'The record has been successfully deleted.', type: MfsBusinessEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string, @Req() req): Promise<any> {
    const mfs_business = await this.mfsBusinessService.findOne(+id, req.user);
    if (!mfs_business) {
      throw new NotFoundException(`MFS business doesn't exist`);
    } else {
      return this.mfsBusinessService.remove(+id, req.user);
    }
  }
}


