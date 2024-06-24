import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProposalUpdateService } from './proposal-update.service';
import {
  CreatedProposalDto,
  UpdatedProposalDto,
} from './dto/proposal-update.dto';
import { Logger } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('proposal-update')
export class ProposalUpdateController {
  private readonly logger = new Logger(ProposalUpdateController.name);
  constructor(private readonly proposalUpdateService: ProposalUpdateService) {}

  @Get('get-proposals')
  getProposals() {
    console.log('in 3003 get proposal ');
    return this.proposalUpdateService.getUpdatedProposals();
  }

  @Post('create-proposal')
  @ApiBody({ type: CreatedProposalDto })
  @ApiResponse({
    status: 200,
    description: 'The message has been successfully pushed.',
    type: CreatedProposalDto,
  })
  placeProposal(@Body() proposal: CreatedProposalDto) {
    console.log('in 3003 place proposal ');
    return this.proposalUpdateService.placeProposal(proposal);
  }

  @Post('update-proposal')
  @ApiBody({ type: UpdatedProposalDto })
  @ApiResponse({
    status: 200,
    description: 'The message has been successfully pushed.',
    type: CreatedProposalDto,
  })
  updateProposal(@Body() proposal: UpdatedProposalDto) {
    console.log('in 3003 place proposal ');
    return this.proposalUpdateService.updateProposal(proposal);
  }

  // @Post('created-proposals')
  // @ApiResponse({
  //   status: 200,
  //   description: 'Created proposals have been fetched and pushed.',
  // })
  // async pushCreatedProposals() {
  //   try {
  //     const createdProposals =
  //       await this.proposalUpdateService.getProposalsCreated();
  //     for (const proposal of createdProposals) {
  //       await this.proposalUpdateService.placeProposal(proposal);
  //     }
  //     return { message: 'Created proposals have been fetched and pushed.' };
  //   } catch (error) {
  //     this.logger.error('Error pushing created proposals:', error);
  //     throw error;
  //   }
  // }

  @Post('executed-proposals')
  @ApiResponse({
    status: 200,
    description: 'Executed proposals have been fetched and pushed.',
  })
  async pushExecutedProposals() {
    try {
      const executedProposals =
        await this.proposalUpdateService.getProposalsExecuted();
      for (const proposal of executedProposals) {
        await this.proposalUpdateService.placeProposal(proposal);
      }
      return { message: 'Executed proposals have been fetched and pushed.' };
    } catch (error) {
      this.logger.error('Error pushing executed proposals:', error);
      throw error;
    }
  }

  @Post('canceled-proposals')
  @ApiResponse({
    status: 200,
    description: 'Canceled proposals have been fetched and pushed.',
  })
  async pushCanceledProposals() {
    try {
      const canceledProposals =
        await this.proposalUpdateService.getProposalsCanceled();
      for (const proposal of canceledProposals) {
        await this.proposalUpdateService.placeProposal(proposal);
      }
      return { message: 'Canceled proposals have been fetched and pushed.' };
    } catch (error) {
      this.logger.error('Error pushing canceled proposals:', error);
      throw error;
    }
  }
}
//   // new apis for proposal updates
//   @Get('created')
//   @ApiResponse({
//     status: 200,
//     description: 'The created proposals have been successfully retrieved.',
//   })
//   @ApiResponse({ status: 401, description: 'Unauthorized.' })

//   async getProposalsCreated(): Promise<any> {
//     try {
//       this.logger.log('Fetching created proposals');
//       return await this.proposalUpdateService.getProposalsCreated();
//     } catch (error) {
//       this.logger.error('Error fetching created proposals:', error);
//       throw error;
//     }
//   }

//   @Get('executed')
//   @ApiResponse({
//     status: 200,
//     description: 'The executed proposals have been successfully retrieved.',
//   })
//   @ApiResponse({ status: 401, description: 'Unauthorized.' })
//   async getProposalsExecuted(): Promise<any> {
//     try {
//       this.logger.log('Fetching executed proposals');
//       return await this.proposalUpdateService.getProposalsExecuted();
//     } catch (error) {
//       this.logger.error('Error fetching executed proposals:', error);
//       throw error;
//     }
//   }

//   @Get('canceled')
//   @ApiResponse({
//     status: 200,
//     description: 'The canceled proposals have been successfully retrieved.',
//   })
//   @ApiResponse({ status: 401, description: 'Unauthorized.' })
//   async getProposalsCanceled(): Promise<any> {
//     try {
//       this.logger.log('Fetching canceled proposals');
//       return await this.proposalUpdateService.getProposalsCanceled();
//     } catch (error) {
//       this.logger.error('Error fetching canceled proposals:', error);
//       throw error;
//     }
//   }

// }
