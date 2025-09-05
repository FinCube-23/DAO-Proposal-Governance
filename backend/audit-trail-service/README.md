# **Service Level Agreement (SLA)**
**Audit Trail Service – Decentralized Application (DApp)**  
**Version:** 1.0  
**Effective Date:** 2025-09-05  


![EDA](https://img.shields.io/badge/Architecture-Event%20Driven-critical)
![Fanout](https://img.shields.io/badge/Exchange-Fanout-orange)
![Async](https://img.shields.io/badge/Flow-Asynchronous-yellow)
![Alchemy](https://img.shields.io/badge/RPC-Alchemy-blue)
![The Graph](https://img.shields.io/badge/Indexer-The%20Graph-purple) 
![GraphQL](https://img.shields.io/badge/API-GraphQL-8E44AD)
![Ethereum](https://img.shields.io/badge/Blockchain-Ethereum-8A2BE2)
![Service](https://img.shields.io/badge/Service-Audit_Trail-FFC107)


---

## **1. Overview**
The **Audit Trail Service** is a core microservice designed to **track and index blockchain transactions** related to business operations in an enterprise-grade manner.  
While public blockchain explorers display all on-chain transactions, this service focuses only on **business-relevant data**.  

It operates as a **background process**, ensuring real-time and fault-tolerant synchronization between **on-chain events** and **off-chain data stores**.  
Additionally, it provides **Web2-compatible event distribution** through **RabbitMQ** for seamless integration with other services.

---

## **2. Key Functionalities**
1. **Real-Time Blockchain Event Tracking**
   - Listens to live RPC endpoints to capture on-chain events as they occur.
   - Publishes acknowledgements to RabbitMQ in near real-time.

2. **Fault-Tolerant Data Recovery**
   - Integrates **The Graph** to query missed or pending transaction hashes.
   - Uses scheduled cron jobs to reconcile events and prevent data loss.

3. **Enterprise-Level Transaction Indexing**
   - Maintains an **off-chain database** containing only relevant transactions related to specific DApp business logic.
   - Enables faster internal analytics and reporting compared to public explorers.

4. **Event Publishing via RabbitMQ**
   - **Fanout Exchange (Default):**  
     - Allows general-purpose event broadcasting to all subscribers.  
     - Any external microservice can connect, consume events, and process them independently.
   - **Topic Exchange (Can be customized for specific business):**  
     - Provides targeted delivery using **on-chain event names as routing keys**.  
     - Suitable for projects with fixed and well-defined business requirements.

---

## **3. Availability and Performance Metrics**

| **Metric**              | **Target**                      | **Description** |
|--------------------------|----------------------------------|----------------|
| **Uptime**              | 99.5% per month                 | The Audit Trail Service should remain operational except during scheduled maintenance windows. |
| **Event Capture Latency** | ≤ 3 seconds                     | Maximum time between on-chain event occurrence and RabbitMQ acknowledgement publishing. |
| **Data Sync Interval**   | Every 30 seconds (cron: `*/30 * * * * *`)       | Frequency of reconciliation with The Graph to capture missed or pending transactions. |
| **RabbitMQ Delivery Guarantee** | At-least-once delivery        | Ensures queued events are never lost, even during subscriber downtime. |


> **Note:**  
> Service uptime and performance metrics are dependent on third-party providers such as:
> - **Alchemy RPC Nodes** – Used for live blockchain event streaming.  
> - **The Graph Protocol** – Used for querying missed or pending transactions.  
>
> Downtime, rate limits, or subscription issues with these external services may cause delays in event capture, reconciliation, or publishing.  
> The Audit Trail Service includes internal fault-tolerant mechanisms (e.g., retry logic and cron-based reconciliation), but **cannot guarantee SLA compliance during third-party outages**.

---


## **4. Responsibilities**

### **4.1 Service Provider (Audit Trail Team)**
- Maintain reliable RPC connections and fallback mechanisms.  
- Ensure integration with The Graph remains functional and up-to-date.  
- Monitor event publishing performance and RabbitMQ health.  
- Provide timely communication for incidents and scheduled maintenance.  
- Maintain a **message retry and dead-letter policy** to handle delivery failures.

### **4.2 Service Consumers**
- Maintain dedicated queues for consuming RabbitMQ events.  
- Implement idempotency in their services to avoid processing duplicate events.  
- Keep their microservices updated to comply with the latest Audit Trail event schema.  
- Subscribe to maintenance and incident notifications.

---

## **5. Fault Tolerance and Recovery**

| **Failure Scenario**               | **Mitigation Strategy** |
|------------------------------------|--------------------------|
| **RPC Downtime / Event Missed**    | Automatic reconciliation via The Graph using scheduled cron jobs. |
| **Subscriber Downtime**            | RabbitMQ queues buffer events until the subscriber comes online. |
| **Message Delivery Failure**       | Retry policy with dead-letter queue for unresolved issues. |
| **Network Partition**              | Service retries connections every 30 seconds until re-established. |

---

## **6. Incident Management**

| **Severity Level** | **Description** | **Response Time** | **Resolution Time** |
|--------------------|-----------------|-------------------|----------------------|
| **Critical** | Complete service outage or failure to publish events. | ≤ 15 minutes | ≤ 4 hours |
| **High** | Delayed publishing or partial indexing failure. | ≤ 30 minutes | ≤ 12 hours |
| **Medium** | Minor sync delays or degraded performance. | ≤ 2 hours | ≤ 24 hours |
| **Low** | Non-critical issues or enhancement requests. | ≤ 24 hours | Best-effort |

---

## **7. Security and Compliance**
- Secure RPC endpoints with proper authentication and access control.  
- Enforce RabbitMQ access with role-based credentials and SSL encryption.  
- Maintain audit logs for all published and consumed events.  
- Comply with relevant blockchain and enterprise data handling regulations.

---

## **8. Maintenance and Upgrades**
- Scheduled maintenance windows will be communicated **at least 24 hours in advance**.  
- Typical maintenance activities include:
  - RPC endpoint updates.
  - RabbitMQ scaling and configuration.
  - Schema upgrades for event payloads.
- Downtime during maintenance **will not count against uptime SLA**.

---

## **9. Change Management**
- Any major change to event schemas or publishing strategies will follow a **versioning policy**.  
- Backward compatibility will be maintained for at least **two release cycles** to allow consumers to upgrade.

---

## **10. Termination of Service**
- If the Audit Trail Service is deprecated:
  - Consumers will be notified **90 days in advance**.
  - A migration plan will be provided, including data export options.

---

## **11. Contact and Support**
| **Support Channel** | **Availability** |
|---------------------|-------------------|
| Email               | Ariful.Islam@brainstation-23.com |
| website     | https://brainstation-23.com/ |
| Incident Hotline    | +97142420223 |

---

## **12. Appendix**
### **12.1 Definitions**
- **RPC Endpoint:** Remote node providing blockchain event data.  
- **The Graph:** Decentralized indexing protocol used for querying blockchain data.  
- **Fanout Exchange:** RabbitMQ exchange type broadcasting messages to all bound queues.  
- **Topic Exchange:** RabbitMQ exchange type for selective event routing using keys.  
- **Dead-Letter Queue (DLQ):** RabbitMQ mechanism for handling failed message deliveries.

---

## **13. Event Contract**

The Audit Trail Service publishes **on-chain acknowledgement events** to RabbitMQ.  
These events serve as the **primary integration point** for other microservices and external systems.  
This section defines the rules and guarantees for event payloads, naming conventions, and backward compatibility.

---

### **13.1 Exchange Details**
| **Parameter**          | **Value** |
|-------------------------|-----------|
| **Default Exchange Type** | `fanout` |
| **Default Exchange Name** | `proposal-update-exchange` |
| **Default Exchange Name** `Proposed` | `audit.web3_event_hub.exchange.fanout` |
| **Default Routing Key** | _N/A_ (Fanout) |
| **Message Delivery Guarantee** | At-least-once |
| **Queue Ownership** | Each subscribed service must maintain its **own dedicated queue**. |

> **Note:**  
> For fanout exchanges, every bound queue receives **all events**.  
> If business requirements demand selective filtering, a topic exchange with routing keys based on event names can be introduced.

---

### **13.2 Event Naming Convention**
- Event names **must be lowercase** and **snake_case**.  
- Prefix events with the **originating blockchain network** for clarity.

**Format:**
`<network>.<contract_name>.<event_name>`

**Example:**
`sepolia.payment_oracle.transaction_confirmed`

---

### **13.3 Event Payload Structure**

Every event follows a standardized JSON schema:

```json
{
  "web3Status": 1,
  "message": "Transaction updated successfully.",
  "data": {
            "proposalId": 786,
            "proposalType": "External",
            "proposedWallet": "0xWaLlEt",
            "__typename": "EventName"
          },
  "blockNumber": 123456,
  "transactionHash": "0xtrx_hash"
}
```

---

## **14. Why Event-Driven Architecture (EDA) and Pub/Sub**

The **Audit Trail Service** is designed as an **asynchronous event-driven system** using **RabbitMQ Pub/Sub** patterns.  
This design choice ensures **scalability**, **fault tolerance**, and **improved user experience** for decentralized application (DApp) users.

---

### **14.1 Context: Blockchain Transaction Flow**

When a user triggers a blockchain operation, the blockchain network requires **confirmation across multiple blocks** before finalizing the transaction.  
This process can take several seconds — or even minutes — depending on network congestion and gas fees.

> **Key Problem:**  
> Holding the user’s request open until the transaction is confirmed would cause **long wait times** and **poor user experience**.

---

### **14.2 Solution: Asynchronous Pub/Sub Flow**

Instead of blocking the user, the Audit Trail service only receives and records the **transaction hash** as a receipt.  
The actual confirmation is processed **asynchronously**, allowing the system to remain **responsive** and **user-friendly**.

**Flow:**
1. **User Action:**  
   The user initiates a blockchain transaction.
2. **Immediate Acknowledgement:**  
   The frontend receives a temporary confirmation containing the transaction hash — **no waiting for blockchain confirmation**.
3. **Background Processing:**  
   - Audit Trail listens to **RPC events** in real time.
   - If an RPC event is missed, it uses **The Graph** to backfill via scheduled cron jobs (`*/30 * * * * *`).
4. **Event Publishing:**  
   When the transaction is finalized on-chain:
   - Audit Trail publishes an **acknowledgement event** to RabbitMQ.
   - All relevant microservices consume this event and **update their off-chain databases** to stay in sync.

---

## **15. Revision History**

| **Version** | **Date** | **Author** | **Changes** |
|-------------|----------|------------|-------------|
| 1.0         | 2025-09-05 | [MD ARIFUL ISLAM](https://www.github.com/FahimDev) | Initial SLA Draft |

---

**Audit Trail Service** is a mission-critical microservice ensuring real-time synchronization and reliable off-chain indexing for decentralized applications. This SLA sets forth clear expectations, responsibilities, and performance metrics to maintain its reliability and scalability.
