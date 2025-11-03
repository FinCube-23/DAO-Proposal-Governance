import { ApiProperty } from '@nestjs/swagger';
import { ProposalType } from 'src/proposal-service/entities/proposal.entity';

export class OnChainDataContextDto {
  __typename: string;
  proposalType?: ProposalType;
  organizationId?: number;

  @ApiProperty({
    description: 'Description of the proposal',
    example: 'New member proposal to add Alice to the DAO',
    required: false,
  })
  description?: string;
  event_logs?: string;
}

export class OnChainDataDto {
  @ApiProperty({
    description: 'The transaction hash when the proposal is placed on-chain',
    example:
      '0xe53c868443504e899c093736281f99a9d0b99d66a7b2ecd53575209fe69a8d2a',
    required: true,
  })
  transactionHash: string;

  @ApiProperty({
    description: 'The wallet address that signed the proposal transaction',
    example: '0xBb85D1852E67D6BEaa64A7eDba802189F0714F97',
    required: true,
  })
  signedBy: string;

  @ApiProperty({
    description: 'The signing method or wallet type used',
    example: 'MetaMask',
    required: false, // Optional field
  })
  signedWith?: string;

  @ApiProperty({
    description: 'The blockchain network chain ID',
    example: '1',
    required: false, // Optional field
  })
  chainId?: string;

  @ApiProperty({
    description: 'Additional context about the transaction',
    example: 'Proposal submitted via DAO governance interface',
    required: false, // Optional field
  })
  context?: OnChainDataContextDto;
}
