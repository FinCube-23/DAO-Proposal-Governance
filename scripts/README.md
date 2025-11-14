# Database Migration Script

This script automates the process of resetting and migrating databases for the Web3 Governance Kit backend services.

## Overview

The migration script performs the following operations:

1. **Truncates tables** in audit-trail-service and dao-service
2. **Optionally deletes entries** from user-management-service (with `-u` flag)
3. **Cleans migration files** from both services
4. **Generates new migrations** based on current entity definitions
5. **Applies migrations** to the databases

## Prerequisites

- Docker and Docker Compose must be running
- All service containers must be up and running:
  ```bash
  # Start all services
  cd backend/audit-trail-service && docker-compose up -d
  cd backend/dao-service && docker-compose up -d
  cd backend/user-management-service && docker-compose up -d
  ```

## Services Affected

### 1. Audit Trail Service
- **Container**: `audit-trail-pgsqldb`
- **Database**: `dao_db`
- **Table**: `transactions`
- **Action**: TRUNCATE (with CASCADE)

### 2. DAO Service
- **Container**: `dao-service-pgsqldb`
- **Database**: `dao_db`
- **Table**: `Proposal`
- **Action**: TRUNCATE (with CASCADE)

### 3. User Management Service (Optional)
- **Container**: `user-management-pgsqldb`
- **Database**: `dao_db`
- **Table**: `onchain_verifications`
- **Action**: DELETE (only when `-u` flag is provided)

## Usage

### Basic Usage (Without User Management)

```bash
cd /home/sampad/Documents/web3-governance-kit/backend
./migrations.sh
```

This will:
- Truncate `transactions` table in audit-trail-service
- Truncate `Proposal` table in dao-service
- Skip user-management-service
- Run migrations for audit-trail-service and dao-service

### With User Management Service

```bash
./migrations.sh -u
```

This will perform all basic operations **plus**:
- Delete all entries from `onchain_verifications` table in user-management-service

## Command Line Options

| Flag | Description |
|------|-------------|
| `-u` | Delete entries from `onchain_verifications` table in user-management-service |

## What Happens During Migration

### Step 1: Table Cleanup
- Checks if tables exist before attempting to truncate/delete
- If table doesn't exist, skips and continues with migrations
- Uses `TRUNCATE ... RESTART IDENTITY CASCADE` for audit-trail and dao services
- Uses `DELETE` for user-management service (preserves table structure)

### Step 2: Migration File Cleanup
```bash
rm -rf ./db/migrations/*
```
Removes all existing migration files from both services.

### Step 3: Dependency Installation
```bash
npm i
```
Installs/updates npm packages for each service.

### Step 4: Migration Generation
```bash
npm run typeorm:generate ./db/migrations/InitialMigration
```
Generates new migration files based on current entity definitions.

### Step 5: Migration Execution
```bash
npm run typeorm:migrate
```

## Troubleshooting

### Error: Container not found
**Problem**: Docker containers are not running.

**Solution**: 
```bash
cd backend/[service-name]
docker-compose up -d
```

### Error: Permission denied
**Problem**: Script doesn't have execute permissions.

**Solution**:
```bash
chmod +x migrations.sh
```

### Error: npm command not found
**Problem**: Node.js is not installed in the service container.

**Solution**: Rebuild the Docker image:
```bash
cd backend/[service-name]
docker-compose build
docker-compose up -d
```

### Error: Table does not exist
**Problem**: This is expected on first run.

**Solution**: The script handles this automatically and proceeds with migrations.

## Safety Features

- ✅ Checks table existence before truncating/deleting
- ✅ Uses `set -e` to stop on any error
- ✅ Provides clear status messages for each step
- ✅ Optional flag for destructive operations (user-management)
- ✅ Uses `CASCADE` to handle foreign key constraints


## Warnings

⚠️ **Data Loss**: This script will permanently delete data from the specified tables. Use with caution in production environments.

⚠️ **Backup First**: Always backup your database before running this script if you need to preserve any data.

⚠️ **Development Only**: This script is intended for development environments. Do not use in production without proper data backup procedures.

## Related Files

- `backend/audit-trail-service/.env` - Audit trail service configuration
- `backend/dao-service/.env` - DAO service configuration
- `backend/user-management-service/.env` - User management service configuration
- `backend/audit-trail-service/docker-compose.yml` - Audit trail service Docker config
- `backend/dao-service/docker-compose.yml` - DAO service Docker config
- `backend/user-management-service/docker-compose.yml` - User management service Docker config
