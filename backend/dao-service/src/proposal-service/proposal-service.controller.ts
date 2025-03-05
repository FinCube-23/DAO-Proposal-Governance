import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProposalServiceService } from './proposal-service.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProposalEntity } from './entities/proposal.entity';
import { PaginatedProposalResponse, ProposalDto } from './dto/proposal.dto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';
// import { ValidateAuth } from '@custom/validate-auth';

@Controller('proposal-service')
export class ProposalServiceController {
  constructor(private readonly proposalService: ProposalServiceService) {}

  // 💬 MessagePattern expects a response | This is a publisher
  @Post()
  @ApiTags('Proposal Off-chain')
  @ApiOperation({
    summary:
      'Inserts new proposal data at off-chain DB and emit message to Audit Trail Service',
  })
  @ApiOkResponse({
    status: 200,
    description: 'The record has been successfully created.',
    type: ProposalEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(
    @Req() req,
    @Body() proposal_entity: ProposalDto,
  ): Promise<ProposalEntity> {
    return this.proposalService.create(proposal_entity);
  }

  @Get('test')
  @ApiTags('Dummy API')
  @ApiOperation({
    summary: 'Dummy Api for testing decorator',
  })
  @ApiResponse({
    status: 200,
    description: 'Dummy description',
  })
  // @ValidateAuth()
  async testDecorator(): Promise<boolean> {
    return await this.proposalService.test();
  }

  @Get(':id')
  @ApiTags('Proposal Off-chain')
  @ApiOperation({ summary: 'Get proposal by ID' })
  @ApiResponse({ status: 200, type: ProposalEntity })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  async findOne(@Param('id') id: number): Promise<ProposalEntity> {
    return this.proposalService.findById(id);
  }

  @Get()
  @ApiTags('Proposal Off-chain')
  @ApiOperation({
    summary: 'Get paginated list of proposals with selected fields',
  })
  @ApiResponse({
    status: 200,
    description: 'Chunk of proposal list are delivered.',
    type: PaginatedProposalResponse,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedProposalResponse> {
    return this.proposalService.findAll(page, limit);
  }

  // 📡 EventPattern is fire-and-forget, so no return value as no response expected | This is a Consumer
  @EventPattern('create-proposal-placed')
  handleCreatedProposalPlaced(
    @Payload() proposal: ResponseTransactionStatusDto,
    @Ctx() context: RmqContext,
  ) {
    this.proposalService.handleCreatedProposalPlacedEvent(proposal, context);
  }
}
