# FinCube - A Plug and Play Web3 Traceability Tool for Enterprise Financial Systems

<div align="center">
  <img src="https://brainstation-23.com/wp-content/uploads/2025/06/image-1-1.png" alt="Brain Station 23 PLC" width="300"/>
  
  **Made by Web3 Team - Brain Station 23 PLC**
</div>

![Layer 1: Ethereum](https://img.shields.io/badge/Layer%201-Ethereum-blue)
![Technology: Blockchain](https://img.shields.io/badge/Technology-Blockchain-lightgrey)
![Made by: Brain Station 23](https://img.shields.io/badge/Made%20by-Brain%20Station%2023-green)

**FinCube** is a blockchain-based traceability platform that links on-chain payment records with traditional enterprise systems to create an **immutable, auditable collaborative system**. It seamlessly integrates with existing ERP and monitoring tools to enhance transparency, compliance, and trust—especially for exchanges, logistics, trade, and government sectors—by enabling secure, end-to-end visibility and faster international settlements using Stablecoins. 

Additionally, it establishes a **unified reconciliation layer** between government bodies and business institutions, ensuring data consistency and accountability across stakeholders.


## Table of Contents

- [FinCube - A Plug and Play Web3 Traceability Tool for Enterprise Financial Systems](#fincube---a-blockchain-based-solution-for-interplanetary-decentralized-mobile-financial-services)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Technical Features](#technical-features)
  - [Architecture](#architecture)
    - [Backend Services](#backend-services)
    - [Frontend Services](#frontend-services)
    - [Web3 services](#web3-services)
  - [Installation](#installation)
  - [Run the application](#run-the-application)
  - [Usage](#usage)
  - [Advantages](#advantages)
  - [Business Model](#business-model)
  - [Roadmap](#roadmap)
    - [Sprint planning](#sprint-planning)
  - [Contributing](#contributing)
  - [License](#license)
  - [Core Contributors](#core-contributors)

## Introduction

FinCube empowers enterprise-grade financial institutions, global e-commerce ecosystems, traders, and export-import houses that want to hold their corporate treasuries in form of stablecoins to move money faster and in real-time. It ensures strict adherence to internal and governmental audit standards, without adding operational complexity or compromising trust.

## Features

- **Real-Time Event Tracking**: Captures on-chain events with 
- **Fault-Tolerant Recovery**: Automatic reconciliation via The Graph every 30 seconds
- **Enterprise-Level Indexing**: Maintains off-chain database with only business-relevant transactions
- **Event-Driven Architecture**: Asynchronous Pub/Sub pattern for non-blocking user experience
- **At-Least-Once Delivery**: RabbitMQ guarantees no event loss with retry policy
- **Dual-Source Monitoring**: Alchemy RPC (real-time) + TheGraph (backfill) for 100% coverage
- **Background Processing**: Scheduled cron jobs for missed transactions
- **Database Migrations**: TypeORM-based PostgreSQL schema management

**Technology Stack**:
- **NestJS**: Modern Node.js framework for scalable server-side applications
- **PostgreSQL + TypeORM**: Enterprise database with migration support (Port 5434)
- **Alchemy RPC**: Primary blockchain data provider for real-time events
- **TheGraph Protocol**: Secondary data source for redundancy and backfill
- **RabbitMQ**: Message queue with at-least-once delivery guarantee
- **Kong Gateway**: API gateway with RabbitMQ publisher plugin

**Current Implementations**:
- DAO governance activity tracking
- FinCube transfer monitoring
- Smart contract event detection
- Transaction receipt processing
- Cross-chain event aggregation


## Technical Features

| Features                      | Technology Used      | Remarks                                                                                                                                                                                           |
| ----------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Containerization              | Docker               | Docker is used to containerize services [FDX standard](https://www.financialdataexchange.org/common/Uploaded%20files/Intoduction%20To%20APIs%203212024_1120.pdf)                                  |
| Message Queue                 | RabbitMQ             | There are multiple services which need to communicate with each other at the same time. Some of them may not be active at the same time. So for interservice communication, Message Queue is used |
| Blockchain Indexer            | The Graph            | Used to listen and query events from the blockchain                                                                                                                                               |
| Proxy Contract                | UUPSUpgradeableProxy | The smart contract is made UUPS upgradeable to incorporate changes on the go                                                                                                                      |
| ReenterancyProof | ReentrancyGuardUpgradeable | ReentrancyProof is a security feature to prevent reentrancy attacks |
| Pagination                    | Solidity             | Pagination is a way for a caller to make multiple smaller requests to retrieve the data. To prevent read function from being overflowed, pagination is used                                       |
| API Gateway                   | Kong OSS            | Redirecting client request to appropriate backend container [FDX standard](https://www.financialdataexchange.org/common/Uploaded%20files/Intoduction%20To%20APIs%203212024_1120.pdf)              |
| Automated Contract Deployment | Shell script         | Ensure the contract compiles and runs all tests before deployment, deploys, creates and moves artifacts to backend web3-proxy container, increasing customization for deployment                  |
| Unit Testing                  | Chai, Mocha          | Unit testing has been done for smart contracts using Chai, Mocha etc. making sure smart contracts adhere to security principles and is vulnerability proof |
| Performance Testing           | K6                   | Performance testing has been done for the system in Production. Please see [performance-testing](https://github.com/FinCube-23/performance-testing) for more details |

## Architecture

FinCube leverages a combination of blockchain technology, smart contracts, and decentralized governance to create a robust and scalable financial platform. The **Audit Trail Service** provides comprehensive blockchain activity monitoring and regulatory compliance. This integration ensures that every transaction, governance action, and smart contract interaction is automatically tracked and auditable. Key components include:

- **Blockchain Ledger**: For recording immutable transaction records.
- **Smart Contracts**: To automate and enforce transaction rules.
- **DAO Governance**: Ensuring democratic decision-making and policy setting.
- **Web3 Integration**: For seamless on-ramping and off-ramping of digital assets.

For a detailed visual representation of the system architecture, see the [Enhanced Architecture Diagram](FinCubeArchitectureDiagram.png).

### Backend Services

| Services                | Technology Used           |
| ----------------------- | ------------------------- |
| Audit-trail-service     | NestJS, Alchemy, TheGraph, RabbitMQ          |
| DAO-service             | NestJS, PostgreSQL        |
| API-gateway             | Kong Gateway, Lua  |
| User-management-service | Django, Django Admin, PostgreSQL |
| Web3-proxy-service      | NestJS, Alchemy, TheGraph   |


Backend folder contains more details regarding each of the services and the APIs.

### Web3 services

Web3 services contain the smart contracts, smart contract testcases, deployment, UUPS proxy deployment functionalities.

**Why Event-Driven Architecture?**

Traditional synchronous approaches would force users to wait for blockchain confirmation (several seconds to minutes), creating poor user experience. FinCube's event-driven architecture solves this:

**The Problem**: Blockchain transactions require confirmation across multiple blocks, which can take significant time depending on network congestion and gas fees.

**The Solution**: Asynchronous Pub/Sub flow that provides instant user feedback while processing confirmations in the background.

**Flow**:
1. **User Action**: User initiates blockchain transaction
2. **Immediate Response**: Frontend receives transaction hash instantly - no waiting
3. **Background Processing**:
   - Audit Trail listens to RPC events in real-time
   - Missed events are backfilled via The Graph (every 30 seconds)
4. **Event Publishing**: When transaction is finalized on-chain:
   - Audit Trail publishes acknowledgement to RabbitMQ
   - All microservices update their off-chain databases asynchronously

**Result**: Users get instant feedback while the system maintains eventual consistency in the background, providing both excellent UX and data integrity.

## Installation

To get started with FinCube, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/FinCube-23/DAO-Proposal-Governance.git
   cd DAO-Proposal-Governance
   ```

2. **Install dependencies**:

   ```bash
   docker compose build
   ```

3. **Configure environment variables**:
   Create a `.env` file and add the necessary environment variables as per the `.env.example` file.

<!-- 4. **Run the application**:
    ```bash
    docker compose up
    ``` -->

## Run the application

In the project root a `./run.sh` can be found. This will help to run the whole application including the frontend and its micro-services.

1. **To run the whole application**:

   ```bash
   ./run.sh up
   ```

2. **To run the frontend only**:

   ```bash
   ./run.sh up-fe
   ```

3. **To run the whole backend including its all micro-service nodes**:

   ```bash
   ./run.sh up-be
   ```

4. **To run a single service from the backend by passing the container name as argument**:
   ```bash
   ./run.sh up-one <SERVICE-NAME>
   ```
5. **To shutdown the whole backend services**:

   ```bash
   ./run.sh down
   ```

6. **To shutdown a single service from the backend by passing the container name as argument**:

   ```bash
   ./run.sh down-one <SERVICE-NAME>
   ```

7. **To explore more with the commands**:
   ```bash
   ./run.sh help
   ```

## Usage

Once the application is running, you can interact with FinCube using the provided web interface or API endpoints. Detailed documentation on the API endpoints and usage examples can be found in the `docs` directory.

## Deployment

### Production Server

The FinCube application is deployed and accessible at:

**🌐 Production URL**: [http://172.16.231.80/](http://172.16.231.80/)


### Environment Configuration

Ensure the following environment variables are properly configured for production:

- **Database Configuration**: PostgreSQL connection strings
- **Blockchain RPC**: Alchemy API keys and endpoints
- **Message Queue**: RabbitMQ credentials and host
- **API Gateway**: Kong Gateway configuration
- **Smart Contract Addresses**: Deployed contract addresses on target network

Refer to `.env.example` for a complete list of required environment variables.


#### Deployment Best Practices

- **Database Migrations**: Always test migrations in staging before production
- **CI/CD Pipeline**: Use GitLab CI/CD for automated testing and deployment. Database migration script added in CI/CD
- **Smart Contract Upgrades**: Use UUPS proxy pattern for contract upgrades
- **Service Dependencies**: Ensure RabbitMQ and PostgreSQL are running before deploying services
- **Monitoring**: Check logs and metrics after deployment
- **Backup**: Always backup database before major deployments

#### Monitoring and Logs

FinCube provides comprehensive monitoring and observability tools:

**Grafana Dashboard**: [http://172.16.231.80:3200](http://172.16.231.80:3200)

Access real-time metrics, visualizations, and system health monitoring through the Grafana dashboard. The dashboard provides:
- Service performance metrics
- Database query performance
- RabbitMQ message queue statistics
- Blockchain event processing metrics
- API gateway request analytics
- Resource utilization (CPU, memory, network)

**Docker Logs**:

```bash
# View all service logs
docker compose logs -f

# View specific service logs
docker compose logs -f <SERVICE-NAME>

# Monitor resource usage
docker stats
```

## Contributing

We welcome contributions from the community! To contribute to FinCube, follow these steps:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Submit a pull request.

Please ensure your code adheres to our coding standards and includes appropriate tests.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Core Contributors

| Name                                                 | Role                            | Technical Contribution                                                              |
| ---------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------- |
| [@FahimDev](https://www.github.com/FahimDev)         | Technical Lead, Solution Architect, Scrum Master | System Architect, Event Driven Architecture Design, Message queue, Backend Dev, Fault-tolerant designer, DevOps |
| [@antonin686](https://www.github.com/antonin686)     | Frontend Lead                   | Full Stack, DevOps, Code Review, UI/UX                                              |
| [@SampadSikder](https://www.github.com/SampadSikder) | Backend Dev, System designer, ZKP Expert, AI/ML    | System Architect, Event Driven Architecture Design, Message queue, Backend Dev, ZKP designer, Smart contract dev |
| [@Raad05](https://github.com/Raad05)                 | Frontend Dev                    | API integration, DevOps, Smart Contract Integration, RainbowKit wagmi, Smart contract dev         |
| [@mashiat0808](https://www.github.com/mashiat0808)   | Backend Dev, Policy analyst     | GraphQL, smart contract testing, FDX                                          |
| [@Samonto-Karmaker](https://github.com/Samonto-Karmaker)   | Backend Dev, ZKP Expert        | Backend Dev, ZKP designer, Smart contract dev, Event Driven Architecture Design    |

---

Thank you for your interest in FinCube! We look forward to your contributions and feedback. For any questions or support, please reach out to our team at daogovernance127@gmail.com.
