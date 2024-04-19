import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { VotingService } from './voting.service';
import { DAOEntity } from './entities/dao.entity';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
@Controller('voting')
export class VotingController {
  constructor(private readonly votingServiceService: VotingService) {}

  @Post()
  @ApiBody({ type: DAOEntity })
  @ApiResponse({ status: 200, description: 'The record has been successfully created.', type: DAOEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() daoEntity: DAOEntity): Promise<DAOEntity> {
    return this.votingServiceService.create(daoEntity);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: DAOEntity })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string): Promise<DAOEntity> {
    const dao = await this.votingServiceService.findOne(+id);
    if (!dao) {
      throw new NotFoundException(`MFS business doesn't exist`);
    } else {
      return dao;
    }
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'The record has been successfully updated.', type: DAOEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() daoEntity: DAOEntity,
  ): Promise<DAOEntity> {
    return this.votingServiceService.update(+id, daoEntity);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'The record has been successfully deleted.', type: DAOEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string): Promise<any> {
    const dao = await this.votingServiceService.findOne(+id);
    if (!dao) {
      throw new NotFoundException(`MFS business doesn't exist`);
    } else {
      return this.votingServiceService.remove(+id);
    }
  }
}
