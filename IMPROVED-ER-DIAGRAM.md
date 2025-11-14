# FinCube: DAO Proposal Governance

## ER Diagram

_Note: timestamptz is used so that we can keep everything in UTC_

### Audit Trail Service

```mermaid
erDiagram

    TRANSACTIONS {
       int id PK "Auto-incrementing primary key"
       string trx_hash UK "Unique transaction hash"
       enum confirmation_source "['alchemy', 'infura', 'graph', 'manual', 'pending_source']; default = 'pending_source'; nullable"
       string trx_metadata "Additional transaction metadata; nullable"
       enum trx_status "[0 => pending, 1 => confirmed]; default = 0"
       string trace_id "Unique identifier to trace transaction across services; nullable"
       json transaction_confirmation_trace "Tracks service synchronization status; nullable"
       timestamptz created_at "Timestamp when record was created"
       timestamptz updated_at "Timestamp when record was last updated"
       jsonb raw_transaction "Raw transaction reciept received from frontend"
       jsonb transaction_receipt "Transaction reciept updated from audit trail from Alchemy"
   }
  

```

The structure of raw_transaction and transaction_receipt:

```bash
Raw transaction
{
    "nonce": 42,
    "gasPrice": "20000000000",
    "gasLimit": "21000",
    "to": "0xF15E6b68541AAe83bB96F61498812c3E0A35F09b",
    "value": "1000000000000000000",
    "data": "0xa9059cbb000000000000000000000000F15E6b68541AAe83bB96F61498812c3E0A35F09b0000000000000000000000000000000000000000000000000de0b6b3a7640000",
    "v": 27,
    "r": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "s": "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321"
}

Transaction Reciept
 {
    "transactionHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "transactionIndex": 5,
    "blockHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "blockNumber": 18500000,
    "from": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "to": "0xF15E6b68541AAe83bB96F61498812c3E0A35F09b",
    "cumulativeGasUsed": 121000,
    "gasUsed": 21000,
    "contractAddress": null,
    "logs": [],
    "status": 1
}
```

Taken from: [Alchemy Docs](https://www.alchemy.com/docs/data/utility-apis/transactions-receipts-endpoints/alchemy-get-transaction-receipts)

### DAO Service

```mermaid
erDiagram

PROPOSAL {
       int id PK "Auto-incrementing primary key"
       int proposal_onchain_id "On-chain proposal ID; nullable; default = null; Assigned by AUDIT TRAIL SERVICE"
       enum proposal_type "['membership', 'general']; default = 'membership'"
       string description "Proposal description; nullable"
       string event_logs "Event log obtained from audit-trail-service when the proposal is created"
       string proposer_address "Wallet address of the proposer"
       enum proposal_status "['pending', 'cancel', 'executed', 'approved']; default = 'pending'"
       string transaction_hash "Transaction hash when proposal is placed"
       int transaction_status "Transaction status; default = 0; Assigned by AUDIT TRAIL SERVICE"
       timestamptz created_at "Timestamp when record was created"
       timestamptz updated_at "Timestamp when record was last updated"
   }
```

### User Management Service

_Note: By default, there will be some roles built into the system._
_These are:_
_1. Super Admin: All Powerful. Approves new Organization applications and the Organization Admin_
_2. Organization Admin: Applies for an Organization. First member of its Organization. Manages rest of the members of its own Organization_
_3. Organization User: A generic member of the Organization. Works as an interface for more concrete dynamic roles depending on the Organization_
_4. End User (optional): Some projects may require end users who are not part of any organization and act as consumers in the system_

_There will also be a PERMISSIONS table and a ROLE_PERMISSIONS junction table which will vary based on different project needs_

```mermaid
erDiagram

USERS {
    int id pk
    string name
    string email uk
    boolean is_verified_email "default = false"
    string password
    string contact_number uk
    boolean is_verified_contact_number "default = false"
    string wallet_address uk "nullable"
    enum status "['pending', 'approved', 'rejected', 'banned']"
    int approved_by fk
    timestamptz created_at
    timestamptz updated_at
}

ORGANIZATIONS {
    int id pk
    string name uk
    string email uk
    string type "Will be transformed to an enum based on future project"
    string address
    boolean is_active
    string legal_entity_identifier "ISO17442: Legal Entity Identifier"
    enum status "['pending', 'approved', 'cancelled', 'banned']; default = 'pending'"
    int organization_admin_id fk
    timestamptz created_at
    timestamptz updated_at
}

ORGANIZATIONS_USERS {
    int id pk
    int user_id fk
    int organization_id fk
}

ONCHAIN_VERIFICATIONS {
    int id pk
    string trx_hash "nullable; default = null; Assign by AUDIT TRAIL SERVICE"
    int onchain_id "nullable; default = null; Assign by AUDIT TRAIL SERVICE"
    enum onchain_status "['register', 'pending', 'approved', 'cancelled']; nullable; default = 'register'"
    json context
    string proposer_wallet "This is suppose to be equal to organization admin wallet; if there is any discrepancy, the org admin will be notified that a new proposer wallet added"
    int organization_id fk
    timestamptz created_at
    timestamptz updated_at
}

USERS ||--|{ ORGANIZATIONS_USERS : "is a"
ORGANIZATIONS_USERS }|--|| ORGANIZATIONS: "belongs to"
USERS ||--|| ORGANIZATIONS : "approves"
ONCHAIN_VERIFICATIONS }|--|| ORGANIZATIONS: "proposes"
USERS ||--|| USERS: "approves"

```