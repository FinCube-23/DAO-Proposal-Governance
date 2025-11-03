# RabbitMQ Testing Scripts

This document contains testing scripts for the DAO Proposal Governance RabbitMQ messaging system.

## Prerequisites

Before running these scripts, ensure you have:

-   RabbitMQ server running
-   `rabbitmqadmin` tool installed
-   Proper authentication credentials

## Usage Instructions

### Option 1: Direct Terminal Execution

If you have `rabbitmqadmin` installed locally, run these commands directly in your terminal:

#### Test Proposal Events

**1. Test Proposal Executed Event:**

```bash
rabbitmqadmin publish \
  exchange=exchange.web3_event_hub.fanout\
  routing_key="" \
  payload='{
    "web3Status": 1,
    "message": "Proposal executed",
    "data": {
      "__typename": "ProposalExecuted",
      "id": 42
    },
    "blockNumber": 123456,
    "transactionHash": "0xtrx_hash"
  }'
```

**2. Test Proposal Added Event:**

```bash
rabbitmqadmin publish \
  exchange=exchange.web3_event_hub.fanout \
  routing_key="" \
  payload='{
    "web3Status": 1,
    "message": "Proposal added",
    "data": {
      "__typename": "ProposalAdded",
      "id": 42,
      "proposedWallet": "0xWalletAddress"
    },
    "blockNumber": 123456,
    "transactionHash": "0xtrx_hash"
  }'
```

**3. Test Proposal Canceled Event:**

```bash
rabbitmqadmin publish \
  exchange=exchange.web3_event_hub.fanout \
  routing_key="" \
  payload='{
    "web3Status": 0,
    "message": "Proposal cancelled",
    "data": {
      "__typename": "ProposalCanceled",
      "id": 42
    },
    "blockNumber": 123456,
    "transactionHash": "0xtrx_hash"
  }'
```

#### Test JWT Authorization

**Test JWT Token Validation:**

```bash
rabbitmqadmin publish \
  exchange=amq.default \
  routing_key=authorization \
  payload='{"data":{"access_token":"testToken123","options":{}}}'
```

### Option 2: Docker Container Execution

If RabbitMQ is running in a Docker container, execute these commands inside the container:

**1. Access the RabbitMQ container:**

```bash
# Find the RabbitMQ container ID or name
docker ps | grep rabbitmq

# Execute commands inside the container
docker exec -it <rabbitmq-container-name> bash
```

**2. Run the test commands inside the container:**

```bash
# Test Proposal Executed Event
rabbitmqadmin publish exchange=exchange.web3_event_hub.fanout routing_key="" payload='{"web3Status": 1,"message": "Proposal executed","data": {"__typename": "ProposalExecuted","id": 42},"blockNumber": 123456,"transactionHash": "0xtrx_hash"}'

# Test Proposal Added Event
rabbitmqadmin publish exchange=exchange.web3_event_hub.fanout routing_key="" payload='{"web3Status": 1,"message": "Proposal added","data": {"__typename": "ProposalAdded","id": 42, "proposedWallet": "0xWalletAddress"},"blockNumber": 123456,"transactionHash": "0xtrx_hash"}'

# Test Proposal Canceled Event
rabbitmqadmin publish exchange=exchange.web3_event_hub.fanout routing_key="" payload='{"web3Status": 0,"message": "Proposal cancelled","data": {"__typename": "ProposalCanceled","id": 42},"blockNumber": 123456,"transactionHash": "0xtrx_hash"}'

# Test JWT Authorization
rabbitmqadmin publish exchange=amq.default routing_key=authorization payload='{"data":{"access_token":"testToken123","options":{}}}'
```

### Option 3: Docker Compose Execution

If using docker-compose, you can execute commands directly:

```bash
# Test Proposal Events
docker-compose exec rabbitmq rabbitmqadmin publish exchange=exchange.web3_event_hub.fanout routing_key="" payload='{"web3Status": 1,"message": "Proposal added","data": {"__typename": "ProposalAdded","id": 42, "proposedWallet": "0xWalletAddress"},"blockNumber": 123456,"transactionHash": "0xtrx_hash"}'

# Test JWT Authorization
docker-compose exec rabbitmq rabbitmqadmin publish exchange=amq.default routing_key=authorization payload='{"data":{"access_token":"testToken123","options":{}}}'
```

## Expected Behavior

### Proposal Events

-   **ProposalExecuted**: Should update onchain verification status to 'approved'
-   **ProposalAdded**: Should create new onchain verification with 'pending' status
-   **ProposalCanceled**: Should update onchain verification status to 'cancelled'

### JWT Authorization

-   Should validate the JWT token and return user information with permissions
-   Check Django user-management-service logs for processing details

## Troubleshooting

**Common Issues:**

1. **Connection refused**: Ensure RabbitMQ is running and accessible
2. **Exchange not found**: Make sure the exchange.web3_event_hub.fanout exists
3. **Permission denied**: Verify RabbitMQ user permissions
4. **Token expired**: Generate a new JWT token if the test token has expired

**Check Consumer Logs:**

```bash
# Check Django consumer logs
docker-compose logs -f user-management-service

# Check RabbitMQ logs
docker-compose logs -f rabbitmq
```

## Notes

-   Replace the JWT token in the authorization test with a valid token from your system
-   Adjust transaction hashes and proposal IDs as needed for your testing
-   Ensure the user-management-service consumers are running before testing
