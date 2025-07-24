import { ApiProperty } from "@nestjs/swagger";
import { OnChainProposalStatus } from "../entities/proposal.entity";

export class OrganizationRegistrationDTO {
  name: string;
  email: string;
  type: string;
  location: string;
  native_currency: string;
  certificate: string;
  on_chain_registration: {
    proposed_wallet: string;
    context: string;
  }
}

export class OrganizationResponseDTO {
  id: number;
  name: string;
  email: string;
  context: string;
  type: string;
  location: string;
  wallet_address: string;
  native_currency: string;
  certificate: string;
  proposal_onchain_id: number;
  is_active: boolean;
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
