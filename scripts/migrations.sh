#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse command line arguments
DELETE_UMS=false
while getopts "u" opt; do
  case $opt in
    u)
      DELETE_UMS=true
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      echo "Usage: $0 [-u]"
      echo "  -u: Delete entries from onchain_verifications table in user-management-service"
      exit 1
      ;;
  esac
done

echo -e "${GREEN}🗑️  Checking and truncating tables if they exist...${NC}"

truncate_if_exists() {
    local container=$1
    local user=$2
    local database=$3
    local table=$4
    local service_name=$5
    
    echo -e "${YELLOW}Checking $table table in $service_name...${NC}"
    
    # Check if table exists
    table_exists=$(docker exec -i $container psql -U $user -d $database -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');")
    
    if [ "$table_exists" = "t" ]; then
        echo -e "${YELLOW}Truncating $table table in $service_name...${NC}"
        docker exec -i $container psql -U $user -d $database -c "TRUNCATE TABLE \"$table\" RESTART IDENTITY CASCADE;"
        echo -e "${GREEN}✓ Truncated $table${NC}"
    else
        echo -e "${RED}Table $table does not exist in $service_name. Skipping truncation.${NC}"
    fi
}

delete_all_entries() {
    local container=$1
    local user=$2
    local database=$3
    local table=$4
    local service_name=$5
    
    echo -e "${YELLOW}Checking $table table in $service_name...${NC}"
    
    # Check if table exists
    table_exists=$(docker exec -i $container psql -U $user -d $database -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');")
    
    if [ "$table_exists" = "t" ]; then
        echo -e "${YELLOW}Deleting all entries from $table table in $service_name...${NC}"
        docker exec -i $container psql -U $user -d $database -c "DELETE FROM \"$table\";"
        echo -e "${GREEN}✓ Deleted all entries from $table${NC}"
    else
        echo -e "${RED}Table $table does not exist in $service_name. Skipping deletion.${NC}"
    fi
}

truncate_if_exists "audit-trail-pgsqldb" "dao" "dao_db" "transactions" "audit-trail-service"

truncate_if_exists "dao-service-pgsqldb" "dao" "dao_db" "Proposal" "dao-service"

if [ "$DELETE_UMS" = true ]; then
    echo -e "${GREEN}🗑️  Processing user-management-service...${NC}"
    delete_all_entries "user-management-pgsqldb" "dao" "dao_db" "onchain_verifications" "user-management-service"
else
    echo -e "${YELLOW}⏭️  Skipping user-management-service (use -u flag to delete entries)${NC}"
fi

echo -e "${GREEN}🧹 Cleaning Audit Trail Service migrations...${NC}"
cd ../backend/audit-trail-service
rm -rf ./db/migrations/*
npm i
npm run typeorm:generate ./db/migrations/InitialMigration
npm run typeorm:migrate

echo -e "${GREEN}🧹 Cleaning DAO Service migrations...${NC}"
cd ../dao-service
rm -rf ./db/migrations/*
npm i
npm run typeorm:generate ./db/migrations/InitialMigration
npm run typeorm:migrate

echo -e "${GREEN}✅ Done!${NC}"
cd ..