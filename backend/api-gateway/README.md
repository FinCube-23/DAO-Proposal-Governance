# API Gateway - Enterprise dApp Integration Hub

## Overview

The API Gateway serves as the central integration hub for our enterprise-grade decentralized application (dApp), providing seamless synchronization between on-chain and off-chain services through an event-driven architecture. This gateway implements a standardized approach to handle crypto wallet interactions without disrupting existing API contracts.

## Philosophy

### The Challenge
In traditional dApp development, frontend teams face the complexity of:
- Managing multiple API calls to keep services synchronized
- Handling wallet transaction states across different services
- Maintaining consistency between on-chain and off-chain data
- Complex error handling for failed transactions

### Our Solution
We introduce a **standardized on-chain data field** (`onChainData`) that:
- **Preserves existing DTOs**: No changes to conventional API contracts
- **Separates concerns**: Wallet details remain separate from business logic
- **Enables event-driven sync**: Automatic notification to all subscribed services
- **Simplifies frontend integration**: Single API call triggers multi-service synchronization

## Data Flow

### 1. Frontend Interaction
```typescript
// Frontend submits form with wallet signature
const submitRegistration = async (formData, walletSignature) => {
  const payload = {
    // Existing DTO remains unchanged
    email: formData.email,
    password: formData.password,
    firstName: formData.firstName,
    lastName: formData.lastName,
    
    // New standardized on-chain data field
    onChainData: {
      transactionHash: walletSignature.txHash,
      signedBy: walletSignature.address,
      signedWith: "MetaMask",
      chainId: "1",
      context: "user-registration"
    }
  };
  
  // Single API call - no complex orchestration needed
  await fetch('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};
```

### 2. API Gateway Processing
```lua
-- Kong Plugin extracts onChainData
if body.onChainData then
  local message = {
    timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
    method = "POST",
    path = "/api/users/register",
    onChainData = body.onChainData,
    full_dto = body
  };
  
  -- Publish to exchange for all subscribers
  publish_to_rabbitmq("exchange.transaction-receipt.fanout", message);
end
```

### 3. Service Subscribers
All backend services receive the same event and log:
```json
{
  "message": "Triggering transaction hash from the from Kong API as on-chain referance",
  "trxHash": "0x1234567890abcdef"
}
```

## Plugin Configuration

### Kong Plugin: `rabbitmq-publisher`

**Purpose**: Automatically extracts `onChainData` from POST/PUT/PATCH requests and publishes to RabbitMQ exchange.

**Configuration**:
```lua
{
  name = "rabbitmq-publisher",
  config = {
    exchange_name = "exchange.transaction-receipt.fanout"
  }
}
```

**Validation Rules**:
- Only processes POST, PATCH, PUT requests
- Requires `onChainData` field in request body
- Validates required fields:
  - `transactionHash`: Blockchain transaction hash
  - `signedBy`: Wallet address that signed the transaction
  - `signedWith`: Wallet type (e.g., "MetaMask")
  - `chainId`: Blockchain network ID
  - `context`: Frontend-defined transaction context

### Kong Manager - Route-Specific Plugin Binding

The plugin can be selectively bound to specific routes that require on-chain transaction handling through Kong Manager UI or API.

#### Using Kong Manager UI

1. **Access Kong Manager**: Navigate to `http://localhost:8002`
2. **Select Route**: Choose the specific route that handles on-chain transactions
3. **Add Plugin**: Click "Add Plugin" and select `rabbitmq-publisher`
4. **Configure**: Set the exchange name and save

#### Using Kong Admin API

```bash
# Bind plugin to user registration route
curl -X POST http://localhost:8001/routes/{route-id}/plugins \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rabbitmq-publisher",
    "config": {
      "exchange_name": "exchange.transaction-receipt.fanout"
    }
  }'

# Bind plugin to DAO voting route
curl -X POST http://localhost:8001/routes/{dao-vote-route-id}/plugins \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rabbitmq-publisher",
    "config": {
      "exchange_name": "exchange.transaction-receipt.fanout"
    }
  }'
```

#### Route Selection Strategy

Bind the plugin only to routes that require on-chain transaction synchronization:

**✅ Routes that SHOULD have the plugin:**
- User registration/login with wallet signature
- DAO proposal voting
- NFT marketplace transactions
- Token purchase/sale
- DeFi operations (staking, liquidity provision)
- Governance actions

**❌ Routes that should NOT have the plugin:**
- Static content delivery
- Health check endpoints
- Authentication token refresh
- Data retrieval (GET requests)
- Admin configuration endpoints

#### Example Route Configurations

```bash
# User Management Service - Registration
curl -X POST http://localhost:8001/routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "user-registration-route",
    "service": {"name": "user-management-service"},
    "paths": ["/user-management-service/api/users/register"],
    "methods": ["POST"]
  }'

# DAO Service - Voting
curl -X POST http://localhost:8001/routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "dao-vote-route", 
    "service": {"name": "dao-service"},
    "paths": ["/dao-service/api/proposals/vote"],
    "methods": ["POST"]
  }'

# Audit Trail Service - Transaction Logging
curl -X POST http://localhost:8001/routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "audit-transaction-route",
    "service": {"name": "audit-trail-service"}, 
    "paths": ["/audit-trail-service/api/transactions"],
    "methods": ["POST", "PUT"]
  }'
```

#### Plugin Management Commands

```bash
# List all plugins
curl http://localhost:8001/plugins

# Get plugin details
curl http://localhost:8001/plugins/{plugin-id}

# Update plugin configuration
curl -X PATCH http://localhost:8001/plugins/{plugin-id} \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "exchange_name": "exchange.transaction-receipt.fanout"
    }
  }'

# Remove plugin from route
curl -X DELETE http://localhost:8001/plugins/{plugin-id}
```

## Message Structure

### Published Message Format
```json
{
  "timestamp": "2025-01-25T10:30:00Z",
  "method": "POST",
  "path": "/api/users/register",
  "onChainData": {
    "transactionHash": "0x1234567890abcdef",
    "signedBy": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "signedWith": "MetaMask",
    "chainId": "1",
    "context": "user-registration"
  },
  "full_dto": {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "onChainData": { /* ... */ }
  }
}
```

## Context Examples

The `context` field allows frontend teams to categorize transactions:

| Context | Description | Use Case |
|---------|-------------|----------|
| `user-registration` | New user signup | KYC verification, account setup |
| `dao-vote` | DAO proposal voting | Governance tracking, vote counting |
| `sell-nft` | NFT marketplace sale | Transaction history, royalty tracking |
| `buy-token` | Token purchase | Portfolio tracking, tax reporting |
| `stake-liquidity` | DeFi liquidity staking | Yield farming, risk management |

## Setup Instructions

### 1. Prerequisites
- Docker and Docker Compose
- RabbitMQ running on port 5672
- Kong API Gateway

### 2. Build and Start
```bash
cd backend/api-gateway
docker-compose up -d --build
```

### 3. Setup Exchange and Queues
```bash
./setup-transaction-receipt-exchange.sh
```

### 4. Seed Kong Database (Recommended)
```bash
# Populate Kong with all services, routes, and plugin configurations
./kong-seeder.sh
```

This script will automatically create:
- All backend services (User Management, DAO, Audit Trail, Web3 Proxy)
- All routes with proper path mappings
- On-chain data publisher plugin on transaction-related routes
- General routes without plugins for non-transaction endpoints

### 5. Manual Configuration (Alternative)
If you prefer manual configuration:

```bash
# Example: Enable plugin on user registration endpoint
curl -X POST http://localhost:8001/plugins \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rabbitmq-publisher",
    "route": {"name": "user-registration-route"},
    "config": {
      "exchange_name": "exchange.transaction-receipt.fanout"
    }
  }'
```

## Monitoring and Debugging

### View Kong Logs
```bash
# Real-time error logs
docker exec -it kong_gateway tail -f /usr/local/kong/logs/error.log

# Filter for on-chain data processing
docker logs kong_gateway | grep -E "(OnChainData|Transaction Hash|Signed By)"
```

### Monitor RabbitMQ Messages
```bash
# Real-time message monitoring
./monitor-rabbitmq.sh -e exchange.transaction-receipt.fanout -f

# List all exchanges
./monitor-rabbitmq.sh -l

# List all queues
./monitor-rabbitmq.sh -q
```

### Check Service Logs
```bash
# User Management Service
docker logs user-management-service | grep "Triggering transaction hash"

# DAO Service  
docker logs dao-service | grep "Triggering transaction hash"

# Audit Trail Service
docker logs audit-trail-service | grep "Triggering transaction hash"
```

## Testing

### Test the Plugin
```bash
# Run comprehensive test suite
./test-onchain-plugin.sh

# Manual test
curl -X POST http://localhost:3000/user-management-service/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "onChainData": {
      "transactionHash": "0x1234567890abcdef",
      "signedBy": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      "signedWith": "MetaMask",
      "chainId": "1",
      "context": "dao-vote"
    }
  }'
```

## Benefits

### For Frontend Teams
- **Simplified Integration**: Single API call triggers multi-service sync
- **No API Changes**: Existing DTOs remain unchanged
- **Standardized Approach**: Consistent pattern across all wallet interactions
- **Reduced Complexity**: No need to manage multiple service calls

### For Backend Teams
- **Event-Driven Architecture**: Loose coupling between services
- **Automatic Synchronization**: All services receive transaction notifications
- **Audit Trail**: Complete transaction history across all services
- **Scalable Design**: Easy to add new subscribers

### For DevOps Teams
- **Centralized Logging**: All wallet interactions logged at gateway level
- **Monitoring**: Real-time visibility into transaction flow
- **Error Handling**: Centralized error management and retry logic
- **Performance**: Efficient message distribution via RabbitMQ

## Security Considerations

- **Data Separation**: Wallet details isolated from business logic
- **Validation**: Strict validation of on-chain data fields
- **Audit Trail**: Complete transaction history for compliance
- **Network Security**: Services communicate within Docker network
- **Authentication**: RabbitMQ access controlled via credentials

## Future Enhancements

- **Message Filtering**: Topic exchange for selective message routing
- **Dead Letter Queues**: Enhanced error handling and retry mechanisms
- **Message Encryption**: End-to-end encryption for sensitive data
- **Metrics Dashboard**: Real-time monitoring and alerting
- **Rate Limiting**: Protection against transaction spam
- **Multi-Chain Support**: Support for multiple blockchain networks

## Database Management

### Kong Database Seeder
The `kong-seeder.sh` script provides a complete Kong configuration setup:

```bash
# Seed Kong with all services, routes, and plugins
./kong-seeder.sh
```

**What it creates:**
- **Services**: All backend services with proper URLs and timeouts
- **Routes**: Transaction routes (with on-chain plugin) and general routes
- **Plugins**: RabbitMQ publisher plugin on on-chain transaction routes

### Kong Database Reset
If you need to start fresh:

```bash
# Clear all Kong configuration
./kong-reset.sh

# Then re-seed
./kong-seeder.sh
```

### Seeded Configuration

**Services Created:**
- `user-management-service` → http://user-management-service:8000
- `dao-service` → http://dao-service:3000
- `audit-trail-service` → http://audit-trail-service:3000
- `web3-proxy-service` → http://web3-proxy-service:3000

**Routes with On-Chain Plugin:**
- User registration/login/profile routes
- DAO proposal creation/voting/update routes
- Audit trail transaction routes
- Web3 transaction routes

**Routes without Plugin:**
- General service routes (GET requests)
- Health check endpoints
- Static content routes

## Troubleshooting

### Common Issues

1. **Plugin Not Triggering**
   - Check if request method is POST/PUT/PATCH
   - Verify `onChainData` field exists in request body
   - Check Kong logs for validation errors
   - Ensure route has the rabbitmq-publisher plugin

2. **Messages Not Reaching Services**
   - Verify RabbitMQ exchange and queues exist
   - Check service connection to RabbitMQ
   - Monitor queue bindings

3. **Missing Transaction Hash**
   - Ensure frontend properly extracts transaction hash from wallet
   - Verify wallet signature process
   - Check transaction confirmation status

4. **Services Not Found**
   - Run `./kong-seeder.sh` to populate Kong database
   - Check if backend services are running
   - Verify service URLs in Kong configuration

### Debug Commands
```bash
# Check Kong status
curl http://localhost:8001/status

# List all services
curl http://localhost:8001/services

# List all routes
curl http://localhost:8001/routes

# List all plugins
curl http://localhost:8001/plugins

# Check RabbitMQ connectivity
curl -u guest:guest http://localhost:15672/api/overview

# View exchange details
curl -u guest:guest http://localhost:15672/api/exchanges/%2F/exchange.transaction-receipt.fanout

# Re-seed Kong database
./kong-seeder.sh
```

---

This API Gateway represents a production-ready solution for enterprise dApp development, providing a robust foundation for on-chain and off-chain service synchronization while maintaining simplicity for frontend integration teams.
