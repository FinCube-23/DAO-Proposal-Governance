# FinCube: DAO Proposal Governance

## ER Diagram

_Note: timestamptz is used so that we can keep everything in UTC_

### Audit Trail Service

```mermaid
erDiagram

    TRANSACTIONS {
        int id pk
        string trx_hash uk
        enum confirmation_source "['alchemy', 'infura', 'graph', 'manual']; default = 'alchemy'"
        string trx_metadata "nullable"
        enum trx_status "[0 => pending, 1 => confirmed]; default = 0"
        json transaction_confirmation_trace
        timestamptz created_at
        timestamptz updated_at
    }

```

### DAO Service

```mermaid
erDiagram

PROPOSAL {
        int id pk
        int proposal_onchain_id "nullable; default = null; Assign by AUDIT TRAIL SERVICE"
        enum proposal_type "['membership', 'general']; default = 'membership'"
        string metadata "nullable"
        string proposer_address
        string processed_by
        enum proposal_status "['pending', 'cancel', 'executed', 'approved']; default = 'pending'"
        string trx_hash
        int audit_id "nullable; Assign by AUDIT TRAIL SERVICE"
        int trx_status "default = 0; Assign by AUDIT TRAIL SERVICE"
        timestamptz created_at
        timestamptz updated_at
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