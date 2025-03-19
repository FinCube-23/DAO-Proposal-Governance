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
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { MfsBusinessService } from './mfs_business.service';
import { MfsBusiness } from './entities/mfs_business.entity';
import { ApiBody, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { MfsBusinessDTO } from './dtos/MfsBusinessDto';
import {
  Ctx,
  RmqContext,
  Payload,
  EventPattern,
} from '@nestjs/microservices';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { OrganizationListResponseDto } from './dtos/organization-list-response.dto';
import { ListOrganizationQueryDto } from './dtos/list-organization.dto';
import { OrganizationDetailResponseDto } from './dtos/organization-detail-response.dto';


@Controller('mfs-business')
export class MfsBusinessController {
  constructor(private readonly mfsBusinessService: MfsBusinessService) { }

  @Post()
  @ApiBody({ type: MfsBusiness })
  @ApiTags("Organization")
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
  @ApiTags("Organization")
  @ApiOkResponse({ type: OrganizationListResponseDto })
  async findAll(@Query() query: ListOrganizationQueryDto): Promise<OrganizationListResponseDto> {
    return this.mfsBusinessService.findAll(query);
  }

  @Get(':id')
  @ApiTags("Organization")
  @ApiOkResponse({ type: OrganizationDetailResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<OrganizationDetailResponseDto> {
    return this.mfsBusinessService.findOne(id);
  }

  @Patch(':id')
  @ApiTags("Organization")
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
}
