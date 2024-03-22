import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VotingServiceService } from './voting-service.service';
import { CreateVotingServiceDto } from './dto/create-voting-service.dto';
import { UpdateVotingServiceDto } from './dto/update-voting-service.dto';

@Controller('voting-service')
export class VotingServiceController {
  constructor(private readonly votingServiceService: VotingServiceService) {}

  @Post()
  create(@Body() createVotingServiceDto: CreateVotingServiceDto) {
    return this.votingServiceService.create(createVotingServiceDto);
  }

  @Get()
  findAll() {
    return this.votingServiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.votingServiceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVotingServiceDto: UpdateVotingServiceDto) {
    return this.votingServiceService.update(+id, updateVotingServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.votingServiceService.remove(+id);
  }
}
