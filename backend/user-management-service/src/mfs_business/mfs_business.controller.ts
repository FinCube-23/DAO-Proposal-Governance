import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MfsBusinessService } from './mfs_business.service';
import { CreateMfsBusinessDto } from './dto/create-mfs_business.dto';
import { UpdateMfsBusinessDto } from './dto/update-mfs_business.dto';

@Controller('mfs-business')
export class MfsBusinessController {
  constructor(private readonly mfsBusinessService: MfsBusinessService) {}

  @Post()
  create(@Body() createMfsBusinessDto: CreateMfsBusinessDto) {
    return this.mfsBusinessService.create(createMfsBusinessDto);
  }

  @Get()
  findAll() {
    return this.mfsBusinessService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mfsBusinessService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMfsBusinessDto: UpdateMfsBusinessDto) {
    return this.mfsBusinessService.update(+id, updateMfsBusinessDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mfsBusinessService.remove(+id);
  }
}
