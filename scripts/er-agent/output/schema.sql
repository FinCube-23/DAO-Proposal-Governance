```sql
CREATE TABLE Proposal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_onchain_id INT DEFAULT NULL,
    proposal_type ENUM('membership', 'general') DEFAULT 'membership' NOT NULL,
    metadata VARCHAR(255) DEFAULT NULL,
    proposer_address VARCHAR(255) NOT NULL,
    processed_by VARCHAR(255) DEFAULT NULL,
    proposal_status ENUM('pending', 'cancel', 'executed', 'approved') DEFAULT 'pending' NOT NULL,
    trx_hash VARCHAR(255) NOT NULL,
    audit_id INT DEFAULT NULL,
    trx_status INT DEFAULT 0 NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);
```