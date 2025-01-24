import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
  Request,
  Req,
  Patch,
} from '@nestjs/common';
import { MfsBusinessService } from './mfs_business.service';
import { MfsBusiness } from './entities/mfs_business.entity';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { MfsBusinessDTO } from './dtos/MfsBusinessDto';
@Controller('mfs-business')
export class MfsBusinessController {
  constructor(private readonly mfsBusinessService: MfsBusinessService) {}

  @Post()
  @ApiBody({ type: MfsBusiness })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully created.',
    type: MfsBusiness,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard)
  async create(
    @Body() mfs_business_body: MfsBusiness,
    @Request() req,
  ): Promise<MfsBusinessDTO> {
    console.log(mfs_business_body);
    return this.mfsBusinessService.create(
      new MfsBusiness({ ...mfs_business_body, user: req.user }),
    );
  }

  @Get()
  @ApiResponse({ status: 200, type: [MfsBusiness] })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(@Req() req): Promise<MfsBusiness[]> {
    console.log(req.user);
    return this.mfsBusinessService.findAll(req.user);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: MfsBusiness })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findOne(@Param('id') id: string, @Req() req): Promise<MfsBusiness> {
    const mfs_business = await this.mfsBusinessService.findOne(+id, req.user);
    if (!mfs_business) {
      throw new NotFoundException(`MFS business doesn't exist`);
    } else {
      return mfs_business;
    }
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: MfsBusiness,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async update(
    @Param('id') id: string,
    @Body() updateMfsBusinessDto: MfsBusiness,
  ): Promise<MfsBusiness> {
    return this.mfsBusinessService.update(+id, updateMfsBusinessDto);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully deleted.',
    type: MfsBusiness,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async remove(@Param('id') id: string, @Req() req): Promise<any> {
    const mfs_business = await this.mfsBusinessService.findOne(+id, req.user);
    if (!mfs_business) {
      throw new NotFoundException(`MFS business doesn't exist`);
    } else {
      return this.mfsBusinessService.remove(+id, req.user);
    }
  }
}
