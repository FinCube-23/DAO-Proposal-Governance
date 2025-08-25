```mermaid
erDiagram
  
    Proposal {
        int id PK "Auto-incrementing primary key for the proposal. Not nullable."
        int proposal_onchain_id "Optional on-chain ID for the proposal. Nullable, defaults to NULL."
        string proposal_type "Type of the proposal. Can be 'membership' or 'general'. Not nullable, defaults to 'membership'."
        string metadata "Additional metadata for the proposal. Nullable, defaults to NULL."
        string proposer_address "Address of the proposer. Not nullable."
        string processed_by "Address of the entity that processed the proposal. Nullable, defaults to NULL."
        string proposal_status "Current status of the proposal. Can be 'pending', 'cancel', 'executed', or 'approved'. Not nullable, defaults to 'pending'."
        string trx_hash "Transaction hash associated with the proposal. Not nullable."
        int audit_id "ID for audit trail. Nullable, defaults to NULL."
        int trx_status "Status of the transaction. Not nullable, defaults to 0."
        datetime created_at "Timestamp when the record was created. Not nullable, defaults to current timestamp."
        datetime updated_at "Timestamp when the record was last updated. Not nullable, defaults to current timestamp and updates on modification."
    }
    
    ```