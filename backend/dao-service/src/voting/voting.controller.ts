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
  Req,
} from '@nestjs/common';
import { VotingService } from './voting.service';
import { DAOEntity } from './entities/dao.entity';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
@Controller('dao')
export class VotingController {
  constructor(private readonly votingServiceService: VotingService) { }

  @Post()
  @ApiBody({ type: DAOEntity })
  @ApiResponse({ status: 200, description: 'The record has been successfully created.', type: DAOEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async create(@Req() req, @Body() daoEntity: DAOEntity): Promise<DAOEntity> {
    return this.votingServiceService.create(req.user, daoEntity);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: DAOEntity })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Req() req, @Param('id') id: string): Promise<DAOEntity> {
    const dao = await this.votingServiceService.findOne(req.user, +id);
    if (!dao) {
      throw new NotFoundException(`DAO doesn't exist`);
    } else {
      return dao;
    }
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'The record has been successfully updated.', type: DAOEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async update(@Req() req,
    @Param('id') id: string,
    @Body() daoEntity: DAOEntity,
  ): Promise<DAOEntity> {
    return this.votingServiceService.update(req.user, +id, daoEntity);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'The record has been successfully deleted.', type: DAOEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async remove(@Req() req, @Param('id') id: string): Promise<any> {
    const dao = await this.votingServiceService.findOne(req.user, +id);
    if (!dao) {
      throw new NotFoundException(`DAO doesn't exist`);
    } else {
      return this.votingServiceService.remove(+id);
    }
  }
}
