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
import { VotingEntity } from './entities/vote.entity';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
@Controller('dao')
export class VotingController {
  constructor(private readonly votingServiceService: VotingService) { }

  @Post()
  @ApiBody({ type: VotingEntity })
  @ApiResponse({ status: 200, description: 'The record has been successfully created.', type: VotingEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async create(@Req() req, @Body() voteEntity: VotingEntity): Promise<VotingEntity> {
    return this.votingServiceService.create(req.user, voteEntity);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: VotingEntity })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Req() req, @Param('id') id: string): Promise<VotingEntity> {
    const dao = await this.votingServiceService.findOne(req.user, +id);
    if (!dao) {
      throw new NotFoundException(`DAO doesn't exist`);
    } else {
      return dao;
    }
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'The record has been successfully updated.', type: VotingEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('jwt'))
  async update(@Req() req,
    @Param('id') id: string,
    @Body() voteEntity: VotingEntity,
  ): Promise<VotingEntity> {
    return this.votingServiceService.update(req.user, +id, voteEntity);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'The record has been successfully deleted.', type: VotingEntity })
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
