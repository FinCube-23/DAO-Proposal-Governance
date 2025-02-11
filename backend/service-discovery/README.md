# NGINX API Gateway with Service Discovery
NGINX is used as an API Gateway with dynamic service discovery, enabling efficient routing to multiple backend services.

## Overview
In microservices architectures, managing communication between services can become complex. NGINX serves as a powerful API Gateway, handling tasks such as load balancing, SSL termination, and dynamic routing. Integrating service discovery allows NGINX to automatically detect and route traffic to available service instances, enhancing scalability and resilience.

## Service Discovery
NGINX has mapped the IP addresses of the following services:
 - User Management Service (user-management-service)
 - Web3 Proxy Service (web3-proxy-service)
 - DAO service (dao-service)
 - Audit Trail Service (audit-trail-service)

Each service can be accessed using
```
    http://localhost:3000/SERVICE_NAME
    
```

## How to run
  - Navigate to service discovery
    ```cd backend/dao-service```
  - Start service discovery
   ``` docker compose up ```


