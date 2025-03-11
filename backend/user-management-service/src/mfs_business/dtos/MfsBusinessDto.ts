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
