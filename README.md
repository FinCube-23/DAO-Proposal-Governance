# FinCube - A Blockchain Based solution for Interplanetary Decentralized Mobile Financial Services

![Layer 1: Ethereum](https://img.shields.io/badge/Layer%201-Ethereum-blue)
![Layer 2: Polygon](https://img.shields.io/badge/Layer%202-Polygon-blueviolet)
![Technology: Blockchain](https://img.shields.io/badge/Technology-Blockchain-lightgrey)
![Made by: Brain Station 23](https://img.shields.io/badge/Made%20by-Brain%20Station%2023-green)

Welcome to FinCube's GitHub repository! FinCube is a revolutionary platform leveraging blockchain technology to provide seamless, secure, and efficient cross-border financial services. By decentralizing control and fostering collaboration among Mobile Financial Services (MFSs), FinCube aims to enhance transparency, reduce transaction times, and lower costs, making financial services more inclusive and accessible.

## Table of Contents

- [FinCube - A Blockchain Based solution for Interplanetary Decentralized Mobile Financial Services](#fincube---a-blockchain-based-solution-for-interplanetary-decentralized-mobile-financial-services)
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

FinCube addresses the inefficiencies of the current financial system, which heavily relies on centralized authorities like Central Banks and systems like SWIFT. By utilizing blockchain technology and decentralized governance through a Decentralized Autonomous Organization (DAO), FinCube enables near-instantaneous transactions, reduced costs, and enhanced security.

## Features

- **Decentralization**: Eliminates single points of failure and ensures continuous operation.
- **Faster Transactions**: Processes transactions almost instantaneously.
- **Cost Efficiency**: Lower transaction fees managed and set by the DAO.
- **Transparency and Trust**: Public ledger for all transactions.
- **Compliance and Security**: Built-in compliance with regulatory requirements and enhanced security through cryptography.
- **Flexibility and Scalability**: Easily adaptable to new market requirements and scalable to include new MFS members.
- **Inclusive Governance**: Democratic decision-making process through the DAO.
- **Economic Inclusivity**: Enhances financial inclusivity in underdeveloped and developing countries.

## Technical Features

| Features                      | Technology Used      | Remarks                                                                                                                                                                                           |
| ----------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Containerization              | Docker               | Docker is used to containerize services [FDX standard](https://www.financialdataexchange.org/common/Uploaded%20files/Intoduction%20To%20APIs%203212024_1120.pdf)                                  |
| Message Queue                 | RabbitMQ             | There are multiple services which need to communicate with each other at the same time. Some of them may not be active at the same time. So for interservice communication, Message Queue is used |
| Blockchain Indexer            | The Graph            | Used to listen and query events from the blockchain                                                                                                                                               |
| Proxy Contract                | UUPSUpgradeableProxy | The smart contract is made UUPS upgradeable to incorporate changes on the go                                                                                                                      |
| Pagination                    | Solidity             | Pagination is a way for a caller to make multiple smaller requests to retrieve the data. To prevent read function from being overflowed, pagination is used                                       |
| API Gateway                   | ExpressJS            | Redirecting client request to appropriate backend container [FDX standard](https://www.financialdataexchange.org/common/Uploaded%20files/Intoduction%20To%20APIs%203212024_1120.pdf)              |
| Automated Contract Deployment | Shell script         | Ensure the contract compiles and runs all tests before deployment, deploys, creates and moves artifacts to backend web3-proxy container, increasing customization for deployment                  |

## Architecture

FinCube leverages a combination of blockchain technology, smart contracts, and decentralized governance to create a robust and scalable financial platform. Key components include:

- **Blockchain Ledger**: For recording immutable transaction records.
- **Smart Contracts**: To automate and enforce transaction rules.
- **DAO Governance**: Ensuring democratic decision-making and policy setting.
- **Web3 Integration**: For seamless on-ramping and off-ramping of digital assets.

### Backend Services

| Services                | Technology Used           |
| ----------------------- | ------------------------- |
| Audit-trail-service     | NestJS, RabbitMQ          |
| DAO-service             | NestJS, PostgreSQL        |
| API-gateway             | NestJS                    |
| User-management-service | NestJS, PostgreSQL, Auth0 |
| Web3-proxy-service      | NestJS, Alchemy, Web3JS   |

Backend folder contains more details regarding each of the services and the APIs.

### Frontend Services

<! -- we can add the screenshots from our project to this -->

### Web3 services

Web3 services contain the smart contracts, smart contract testcases, deployment, UUPS proxy deployment functionalities.

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

## Advantages

- **Eradicates Current Problems**: Removes reliance on centralized authorities, enabling faster and more controlled transactions.
- **Better than Centralized Systems**: Offers decentralization, faster transactions, cost efficiency, transparency, compliance, scalability, inclusive governance, and increased economic inclusivity.

## Business Model

FinCube's revenue streams include:

- **Commission Fees**: From cross-border financial services transactions.
- **Advertisement**: Targeted ads on the platform.
- **Data Analytics**: Insights into customer behavior and trends.
- **Auditing**: Compliance and regulatory audits.

## Roadmap

1. Scale to include banks and cryptocurrency providers.
2. Integrate advanced security measures like SMPC and ZK Proof.
3. Develop a credit system and staking mechanism.
4. Implement periodic transactions and remittance features.
5. Ensure cross-currency bill and service payments.

### Sprint planning

Sprint plans of the project is [here](https://docs.google.com/spreadsheets/d/1H1C_8erMfxNjflPygsy6K6sB8qtqSrySQkH1MoQ7cOQ/edit?usp=sharing).

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
| [@FahimDev](https://www.github.com/FahimDev)         | Technical Lead and Scrum Master | Event Driven Architecture Design, Message queue, Backend Dev, The Graph integration |
| [@antonin686](https://www.github.com/antonin686)     | Frontend Lead                   | Full Stack, DevOps, Code Review, UI/UX                                              |
| [@SampadSikder](https://www.github.com/SampadSikder) | Backend Dev, System designer    | Smart contract dev, smart contract testing                                          |
| [@Raad05](https://github.com/Raad05)                 | Frontend Dev                    | API integration, Smart Contract Integration, RainbowKit wagmi                       |
| [@mashiat0808](https://www.github.com/mashiat0808)   | Backend Dev, Policy analyst     | GraphQL, smart contract testing, FDX                                                |

---

Thank you for your interest in FinCube! We look forward to your contributions and feedback. For any questions or support, please reach out to our team at daogovernance127@gmail.com.
