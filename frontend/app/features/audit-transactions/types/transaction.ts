export interface TransactionFilters {
  chain_reference?: string[];
  status?: string[];
  time_range?: { start: string; end: string };
  function_selector?: string;
  function_name?: string;
  resource_kind?: string[];
  participant_address?: string;
  tags?: string[];
  action_code?: string[];
  min_value?: string;
  max_value?: string;
}
