##  Development Setup — User Management Service

Before starting the service in development mode, be sure to initialize your database and create an administrative user:

```bash
# 1. Apply database migrations
python manage.py migrate

# 2. Create a superuser (admin account)
python manage.py createsuperuser
```

## User Management Activity Diagram
![User Management Activity Diagram](Activity_diagram.png)


## User Management Service

```mermaid
erDiagram

USERS {
    int id pk
    string first_name "django default"
    string last_name "django default"
    string email uk
    boolean is_verified_email "default = false"
    string password
    string contact_number uk
    boolean is_verified_contact_number "default = false"
    string wallet_address uk "nullable"
    enum status "['pending', 'approved', 'rejected', 'banned']; Future work: Will be shifted to ORGANIZATIONS_USERS table"
    int approved_by_id fk
    boolean is_staff "django default; def: 'Allows this user to access the admin site.'"
    boolean is_active "django default; def: 'When false, disables login and permissions for a user (in Django's default backends) without deleting their account, preventing foreign key issues.'"
    boolean is_superuser "django default; def: 'Treats this user as having all permissions without assigning any permission to it in particular.'"
    timestamptz last_login "django default; A datetime of the user’s last login."
    timestamptz date_joined "django default; The date/time when the account was created. (same as created_at)"
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
    string trx_hash uk
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