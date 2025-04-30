import { ApiProperty } from '@nestjs/swagger';
import { OnChainProposalStatus } from '../entities/mfs_business.entity';

class UserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class OrganizationDetailResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  context: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  is_approved: boolean;

  @ApiProperty({ nullable: true })
  wallet_address: string;

  @ApiProperty()
  native_currency: string;

  @ApiProperty({ nullable: true })
  certificate: string;

  @ApiProperty({ nullable: true })
  trx_hash: string;

  @ApiProperty({ nullable: true })
  proposal_onchain_id: number;

  @ApiProperty({ enum: OnChainProposalStatus })
  membership_onchain_status: OnChainProposalStatus;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ type: UserDto, nullable: true })
  user: UserDto | null;
}