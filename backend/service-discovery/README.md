# NGINX API Gateway with Service Discovery

![Deprecated](https://img.shields.io/badge/Status-DEPRECATED-red)
![Replaced](https://img.shields.io/badge/Replaced%20By-Kong%20API%20Gateway-blue)

> **⚠️ DEPRECATED**: This service has been replaced by Kong API Gateway with advanced on-chain transaction handling capabilities.

## Overview

This was a simple NGINX-based API Gateway that provided basic service discovery and routing functionality for our microservices architecture. It served as the initial entry point for routing requests to backend services.

## What This Service Did

- **Basic Routing**: Simple proxy routing to backend services
- **Service Discovery**: Static mapping of service endpoints
- **Load Balancing**: Basic request distribution
- **SSL Termination**: HTTPS handling (in production config)

## Service Mapping

The NGINX gateway mapped the following services:
- User Management Service (user-management-service) → Port 3001
- Web3 Proxy Service (web3-proxy-service) → Port 3004  
- DAO Service (dao-service) → Port 3002
- Audit Trail Service (audit-trail-service) → Port 3003

Each service was accessible via:
```
http://localhost:3000/SERVICE_NAME
```

## Why It Was Replaced

This simple NGINX gateway was replaced by **Kong API Gateway** (`/backend/api-gateway/`) for the following reasons:

### ❌ Limitations of NGINX Gateway
- **No Plugin System**: Could not extend functionality
- **No On-Chain Integration**: No support for blockchain transaction handling
- **Static Configuration**: Required manual updates for new services
- **Limited Monitoring**: Basic logging only
- **No Event-Driven Architecture**: Could not publish to message queues

### ✅ Benefits of Kong API Gateway
- **Advanced Plugin System**: Custom plugins for on-chain data processing
- **Event-Driven Architecture**: RabbitMQ integration for service synchronization
- **Dynamic Configuration**: API-driven configuration management
- **Comprehensive Monitoring**: Detailed logging and metrics
- **Enterprise Features**: Rate limiting, authentication, and more

## Migration Information

### Old Endpoints (Deprecated)
```
http://localhost:3000/user-management-service/api/users/login
http://localhost:3000/dao-service/api/proposals
http://localhost:3000/audit-trail-service/api/transactions
http://localhost:3000/web3-proxy-service/api/web3
```

### New Endpoints (Kong API Gateway)
```
http://localhost:3000/user-management-service/api/users/login
http://localhost:3000/dao-service/api/proposals  
http://localhost:3000/audit-trail-service/api/transactions
http://localhost:3000/web3-proxy-service/api/web3
```

> **Note**: The endpoint URLs remain the same, but now go through Kong with enhanced on-chain transaction capabilities.

## How to Run (Legacy)

> **⚠️ This is for reference only. Use Kong API Gateway instead.**

```bash
cd backend/service-discovery
docker compose up
```

## Next Steps

1. **Use Kong API Gateway**: Navigate to `/backend/api-gateway/` for the current implementation
2. **Read Kong Documentation**: See `/backend/api-gateway/README.md` for complete setup instructions
3. **On-Chain Integration**: The new gateway supports `onChainData` field for blockchain transactions
4. **Event-Driven Sync**: Automatic service synchronization via RabbitMQ

---

**For current API Gateway implementation, please refer to:**
📁 `/backend/api-gateway/README.md`


