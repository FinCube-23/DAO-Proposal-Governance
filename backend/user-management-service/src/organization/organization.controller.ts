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
  BadRequestException,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Organization } from './entities/organization.entity';
import {
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  OrganizationRegistrationDTO,
  OrganizationResponseDTO,
  StatusResponseDto,
} from './dtos/organization.dto';
import { Ctx, RmqContext, Payload, EventPattern } from '@nestjs/microservices';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { OrganizationListResponseDto } from './dtos/organization-list-response.dto';
import { ListOrganizationQueryDto } from './dtos/list-organization.dto';
import { OrganizationDetailResponseDto } from './dtos/organization-detail-response.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @ApiTags('Organization')
  @ApiResponse({
    status: 201,
    description: 'Organization successfully registered in off-chain.',
    type: OrganizationResponseDTO,
  })
  @UseGuards(AuthGuard)
  async create(
    @Body() organizationDto: OrganizationRegistrationDTO,
    @Request() req,
  ): Promise<OrganizationResponseDTO> {
    return this.organizationService.create(organizationDto, req.user);
  }

  @Get('status-by-email')
  @ApiTags('Organization-Profile-Status')
  @ApiOkResponse({ type: StatusResponseDto })
  @ApiQuery({ name: 'email', required: true, type: String })
  async getStatusByEmail(
    @Query('email') email: string,
  ): Promise<StatusResponseDto> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    return this.organizationService.getStatusByEmail(email);
  }

  @Get()
  @ApiTags('Organization')
  @ApiOkResponse({ type: OrganizationListResponseDto })
  async findAll(
    @Query() query: ListOrganizationQueryDto,
  ): Promise<OrganizationListResponseDto> {
    return this.organizationService.findAll(query);
  }

  @Get(':id')
  @ApiTags('Organization')
  @ApiOkResponse({ type: OrganizationDetailResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrganizationDetailResponseDto> {
    return this.organizationService.findOne(id);
  }

  @Patch(':id')
  @ApiTags('Organization')
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: Organization,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: Organization,
  ): Promise<Organization> {
    return this.organizationService.update(+id, updateOrganizationDto);
  }
}
