import { ApiProperty } from '@nestjs/swagger';
import { OnChainProposalStatus } from '../entities/proposal.entity';

export class OrganizationListItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  location: string;

  @ApiProperty({ enum: OnChainProposalStatus })
  membership_onchain_status: OnChainProposalStatus;
}

export class OrganizationListResponseDto {
  @ApiProperty({ type: [OrganizationListItemDto] })
  data: OrganizationListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}