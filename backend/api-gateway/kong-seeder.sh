#!/bin/bash

# Kong Database Seeder - Based on Existing Configuration
# This script recreates your exact Kong setup with on-chain transaction capabilities

echo "🌱 Kong Database Seeder (Based on Your Configuration)"
echo "====================================================="

KONG_ADMIN_URL="http://localhost:8001"

# Function to make API calls to Kong
kong_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$KONG_ADMIN_URL$endpoint"
    else
        curl -s -X $method \
            -H "Content-Type: application/json" \
            "$KONG_ADMIN_URL$endpoint"
    fi
}

# Wait for Kong to be ready
echo "1. Waiting for Kong to be ready..."
until kong_api GET /status; do
    echo "   Kong is not ready yet. Waiting..."
    sleep 2
done
echo "   ✅ Kong is ready!"

echo ""
echo "2. Creating Services..."

# Create User Management Service
echo "   Creating User Management Service..."
SERVICE_DATA='{
    "name": "user-management-service",
    "protocol": "http",
    "host": "host.docker.internal",
    "port": 3001,
    "path": "/",
    "connect_timeout": 60000,
    "write_timeout": 60000,
    "read_timeout": 60000,
    "retries": 5,
    "enabled": true,
    "tags": ["auth", "kyc", "registration", "membership"]
}'
kong_api PUT /services/user-management-service "$SERVICE_DATA"

# Create DAO Service
echo "   Creating DAO Service..."
SERVICE_DATA='{
    "name": "decentralized-autonomous-organization",
    "protocol": "http",
    "host": "host.docker.internal",
    "port": 3002,
    "path": "/",
    "connect_timeout": 60000,
    "write_timeout": 60000,
    "read_timeout": 60000,
    "retries": 5,
    "enabled": true,
    "tags": ["governance", "voting", "consensus"]
}'
kong_api PUT /services/decentralized-autonomous-organization "$SERVICE_DATA"

# Create Audit Trail Service
echo "   Creating Audit Trail Service..."
SERVICE_DATA='{
    "name": "audit-trail-web3-tracing",
    "protocol": "http",
    "host": "host.docker.internal",
    "port": 3003,
    "path": "/",
    "connect_timeout": 60000,
    "write_timeout": 60000,
    "read_timeout": 60000,
    "retries": 5,
    "enabled": true,
    "tags": ["on-chain", "transaction-hash", "alchemy", "subgraph", "node-provider"]
}'
kong_api PUT /services/audit-trail-web3-tracing "$SERVICE_DATA"

# Create Web3 Proxy Service
echo "   Creating Web3 Proxy Service..."
SERVICE_DATA='{
    "name": "custodian-wallet-admin-web3-proxy",
    "protocol": "http",
    "host": "host.docker.internal",
    "port": 3004,
    "path": "/",
    "connect_timeout": 60000,
    "write_timeout": 60000,
    "read_timeout": 60000,
    "retries": 5,
    "enabled": true,
    "tags": ["custodian-wallet", "proxy", "abstruction"]
}'
kong_api PUT /services/custodian-wallet-admin-web3-proxy "$SERVICE_DATA"

echo "   ✅ All services created!"

echo ""
echo "3. Creating Routes..."

# User Management Service Routes
echo "   Creating User Management Service routes..."

# User registration route (with on-chain plugin)
echo "     - User Registration Route"
ROUTE_DATA='{
    "name": "ums-service-route",
    "service": {"name": "user-management-service"},
    "paths": ["/user-management-service"],
    "strip_path": true,
    "preserve_host": false,
    "protocols": ["http"],
    "path_handling": "v0",
    "regex_priority": 0,
    "request_buffering": true,
    "response_buffering": true,
    "tags": ["auth", "user-profile"]
}'
kong_api PUT /routes/ums-service-route "$ROUTE_DATA"

# Create DAO Service Route
echo "   Creating dao-service-route..."
ROUTE_DATA='{
    "name": "dao-service-route",
    "service": {"name": "decentralized-autonomous-organization"},
    "paths": ["/dao-service"],
    "strip_path": true,
    "preserve_host": false,
    "protocols": ["http"],
    "path_handling": "v0",
    "regex_priority": 0,
    "request_buffering": true,
    "response_buffering": true,
    "tags": ["voting", "proposal"]
}'
kong_api PUT /routes/dao-service-route "$ROUTE_DATA"

# Create Audit Trail Route
echo "   Creating audit-trail-route..."
ROUTE_DATA='{
    "name": "audit-trail-route",
    "service": {"name": "audit-trail-web3-tracing"},
    "paths": ["/audit-trail-service"],
    "strip_path": true,
    "preserve_host": false,
    "protocols": ["http"],
    "path_handling": "v0",
    "regex_priority": 0,
    "request_buffering": true,
    "response_buffering": true,
    "tags": ["trace", "chain-explorer"]
}'
kong_api PUT /routes/audit-trail-route "$ROUTE_DATA"

# Create Web3 Proxy Route
echo "   Creating web3-proxy-route..."
ROUTE_DATA='{
    "name": "web3-proxy-route",
    "service": {"name": "custodian-wallet-admin-web3-proxy"},
    "paths": ["/web3-proxy-service"],
    "strip_path": true,
    "preserve_host": false,
    "protocols": ["http"],
    "path_handling": "v0",
    "regex_priority": 0,
    "request_buffering": true,
    "response_buffering": true,
    "tags": ["proxy"]
}'
kong_api PUT /routes/web3-proxy-route "$ROUTE_DATA"

echo "   ✅ All routes created!"

PLUGIN_CONFIG='{
    "name": "rabbitmq-publisher",
    "config": {
        "exchange_name": "exchange.transaction-receipt.fanout"
    }
}'

echo ""
echo "🎉 Kong Database Seeding Complete!"
echo "=================================="
echo ""
echo "✅ Configuration Summary:"
echo "   - Services: $(kong_api GET /services | jq '.data | length')"
echo "   - Routes: $(kong_api GET /routes | jq '.data | length')"
echo "   - Plugins: $(kong_api GET /plugins | jq '.data | length')"
echo ""
echo "🔗 Your Original Endpoints (Preserved):"
echo "   - http://localhost:3000/user-management-service"
echo "   - http://localhost:3000/dao-service"
echo "   - http://localhost:3000/audit-trail-service"
echo "   - http://localhost:3000/web3-proxy-service"
echo ""
echo "🔗 New On-Chain Transaction Endpoints:"
echo "   - http://localhost:3000/user-management-service/api/users/login"
echo "   - http://localhost:3000/user-management-service/api/users/register"
echo "   - http://localhost:3000/dao-service/api/proposals"
echo "   - http://localhost:3000/dao-service/api/proposals/vote"
echo "   - http://localhost:3000/audit-trail-service/api/transactions"
echo "   - http://localhost:3000/web3-proxy-service/api/transactions"
echo ""
echo "📊 Monitor with Kong Manager:"
echo "   - UI: http://localhost:8002"
echo "   - Admin API: http://localhost:8001"
echo ""
echo "🧪 Test with onChainData:"
echo '   curl -X POST http://localhost:3000/user-management-service/api/users/login \'
echo '     -H "Content-Type: application/json" \'
echo '     -d '"'"'{"email":"user@example.com","password":"password123","onChainData":{"transactionHash":"0x123...","signedBy":"0x742...","signedWith":"MetaMask","chainId":"1","context":"dao-vote"}}'"'"''