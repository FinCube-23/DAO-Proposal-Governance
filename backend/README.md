# FinCube Backend

[![Layer 1: Ethereum](https://img.shields.io/badge/Layer%201-Ethereum-blue)](https://ethereum.org/)
[![Layer 2: Polygon](https://img.shields.io/badge/Layer%202-Polygon-blueviolet)](https://polygon.technology/)
[![Technology: Blockchain](https://img.shields.io/badge/Technology-Blockchain-lightgrey)](https://www.blockchain.com/)
[![Made by: Brain Station 23](https://img.shields.io/badge/Made%20by-Brain%20Station%2023-green)](https://brainstation-23.com/)

## Overview

The backend for fincube is built to manage and support the decentralized autonomous organization (DAO) functionalities, financial services, and blockchain interactions required by the fincube platform. It is designed using modern technologies to ensure scalability, security, and interoperability with blockchain networks.

## Table of Contents

- [Technologies](#technologies)
- [Architecture](#architecture)
- [Services](#services)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Services](#running-the-services)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Technologies

- **Layer 1:** Ethereum
- **Layer 2:** Polygon
- **Technology:** Blockchain
- **Backend Framework:** NestJS
- **Database:** PostgreSQL
- **Messaging Queue:** RabbitMQ
- **Containerization:** Docker
- **API Gateway:** Nginx
- **Authentication:** Auth0
- **Web3 Integration:** Alchemy, Web3JS

## Architecture

The backend is structured into multiple microservices, each responsible for specific functionalities:

1. **DAO Service:** Manages DAO-related data and proposals.
2. **User Management Service:** Handles user registration, authentication, and profile management.
3. **Web3 Proxy Service:** Interacts with blockchain smart contracts and performs necessary transactions.
4. **Audit Trail Service:** Records and manages audit logs for DAO activities and proposals.
5. **Currency Exchange Service:** Manages stablecoin and token exchange functionalities.

## Services

### DAO Service

- **Purpose:** Manage DAO creation, proposal submission, and voting.
- **API Endpoints:** `/dao-service`, `/dao-service/proposal-service`
- **Technology:** NestJS, PostgreSQL

### User Management Service

- **Purpose:** Handle user registration, authentication, and profile management.
- **API Endpoints:** `/user-management-service/mfs-business`, `/user-management-service/exchange-user`
- **Technology:** NestJS, PostgreSQL, Auth0

### Web3 Proxy Service

- **Purpose:** Interact with blockchain via smart contracts for DAO operations.
- **API Endpoints:** `/web3-proxy-service/web3-dao-proxy`
- **Technology:** NestJS, Alchemy, Web3JS

### Audit Trail Service

- **Purpose:** Record and track all DAO-related activities and proposals.
- **API Endpoints:** N/A (Message Queue integration)
- **Technology:** NestJS, RabbitMQ

### API Gateway

- **Purpose:** Client requests from frontend are rerouted using this API gateway.
- **API Endpoints:** N/A
- **Technology:** NestJS

## Installation

To install and run the backend services, follow these steps:

1. **Clone the repository:**
    ```bash
    git clone https://github.com/FinCube-23/DAO-Proposal-Governance.git
    cd DAO-Proposal-Governance/backend
    ```

2. **Install dependencies:**
    Ensure you have Docker installed. Build the containers using:
    ```bash
    docker compose build
    ```

3. **Setup Docker:**
    Ensure you have Docker installed. Start the containers using:
    ```bash
    docker-compose up 
    ```

## Configuration

Each service has its own configuration file located in its respective directory. Make sure to set the necessary environment variables for database connections, Auth0, and blockchain API keys.

### Example `.env` file for DAO Service:
```plaintext
APP_ENV=
APP_PORT=
DB_HOST=
DB_PORT=
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
PGADMIN_DEFAULT_EMAIL=
PGADMIN_DEFAULT_PASSWORD=
AUTH0_ISSUER_URL= 
AUTH0_AUDIENCE= 
SEPOLIA_API_KEY=
PROPOSAL_TOPIC=
PROPOSAL_END_TOPIC=
DAO_CONTRACT_ADDRESS= 

 ```
