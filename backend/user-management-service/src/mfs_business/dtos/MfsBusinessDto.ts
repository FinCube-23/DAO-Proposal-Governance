import { ApiProperty } from "@nestjs/swagger";
import { OnChainProposalStatus } from "../entities/mfs_business.entity";

export class MfsBusinessDTO {
  id: number;
  name: string;
  email: string;
  context: string;
  type: string;
  location: string;
  is_approved: boolean;
  wallet_address: string;
  native_currency: string;
  certificate: string;
  proposal_onchain_id: number;
  membership_onchain_status: string;
}

export class StatusResponseDto {
  @ApiProperty({ enum: OnChainProposalStatus })
  membership_onchain_status: OnChainProposalStatus;
  
  @ApiProperty()
  id: number;
  
  @ApiProperty()
  email: string;
}
