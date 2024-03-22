import { Controller, Get, Post, Body, Put, Param, Delete, NotFoundException } from '@nestjs/common';
import { VotingService } from './voting.service';
import { DAOEntity } from './entities/dao.entity';
@Controller('voting')
export class VotingController {
  constructor(private readonly votingServiceService: VotingService) { }

  @Post()
  async create(@Body() daoEntity: DAOEntity): Promise<DAOEntity> {
    return this.votingServiceService.create(daoEntity);
  }


  @Get(':id')
  async findOne(@Param('id') id: string): Promise<DAOEntity> {
    const dao = await this.votingServiceService.findOne(+id);
    if (!dao) {
      throw new NotFoundException(`MFS business doesn't exist`);
    } else {
      return dao;
    }
  }


  @Put(':id')
  async update(@Param('id') id: string, @Body() daoEntity: DAOEntity): Promise<DAOEntity> {
    return this.votingServiceService.update(+id, daoEntity);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<any> {
    const dao = await this.votingServiceService.findOne(+id);
    if (!dao) {
      throw new NotFoundException(`MFS business doesn't exist`);
    } else {
      return this.votingServiceService.remove(+id);
    }
  }
}
