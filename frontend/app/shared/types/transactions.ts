export interface Transaction {
  id: string;
  global_tx_uid: string;
  chain_reference: string;
  status: 'pending' | 'success' | 'failed' | 'reverted' | 'submitted' | 'replaced';
  tx_hash: string;
  block_number?: number;
  block_timestamp: string;
  from_address: string;
  to_address?: string;
  function_name?: string;
  function_selector?: string;
  value_raw: string;
  value_decimals: number;
  value_currency: string;
  gas_used?: number;
  gas_price?: string;
  effective_fee_raw?: string;
  tags: string[];
  top_event?: string;
  action_codes: string[];
  confirmations?: number;
  integrity_hash?: string;
  indexer_version?: string;
  first_seen_at: string;
  last_observed_at: string;
  source: 'alchemy' | 'graph';
  event_logs?: Array<{
    event_name: string;
    contract_address: string;
    topics: string[];
    data: string;
    block_number: number;
    log_index: number;
  }>;
  flow?: Array<{ service: string; status: 'completed' | 'pending' | 'failed' | 'waiting'; timestamp: string }>;
  [key: string]: any; // For any additional dynamic fields
}
