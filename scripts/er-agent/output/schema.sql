```sql
-- Enum Definitions (for reference, actual SQL uses VARCHAR/TEXT for enum columns)
-- OrganizationApprovalStatus: 'banned', 'pending', 'approved', 'cancelled'
-- UserProfileStatus: 'pending', 'approved', 'cancelled'
-- OnChainProposalStatus: 'register', 'pending', 'approved', 'cancelled'
-- Role: (Values for this enum were not provided in the entity definitions, assumed to be string values)

CREATE TABLE `exchange_users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `balance` FLOAT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL -- For MySQL, consider adding ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `is_verified_email` BOOLEAN DEFAULT FALSE NOT NULL,
    `wallet_address` VARCHAR(255) NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL, -- Stores enum Role values
    `contact_number` VARCHAR(20) UNIQUE NOT NULL,
    `is_verified_contact` BOOLEAN DEFAULT FALSE NOT NULL,
    `onchain_status` VARCHAR(255) DEFAULT 'pending' NOT NULL, -- Stores enum UserProfileStatus values
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL -- For MySQL, consider adding ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `organizations` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) UNIQUE NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `native_currency` VARCHAR(255) NOT NULL,
    `certificate` VARCHAR(255) NULL,
    `is_active` BOOLEAN DEFAULT FALSE NOT NULL,
    `status` VARCHAR(255) DEFAULT 'pending' NULL, -- Stores enum OrganizationApprovalStatus values
    `approved_by` INT NULL, -- This is a simple INT column, not a TypeORM foreign key relation
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL -- For MySQL, consider adding ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `proposals` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `trx_hash` VARCHAR(255) DEFAULT NULL NULL,
    `onchain_id` INT DEFAULT NULL NULL,
    `proposed_wallet` VARCHAR(255) NOT NULL,
    `context` VARCHAR(255) NOT NULL,
    `onchain_status` VARCHAR(255) DEFAULT 'register' NULL, -- Stores enum OnChainProposalStatus values
    `organizationId` INT NOT NULL, -- Foreign key for ManyToOne relationship with Organization
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, -- For MySQL, consider adding ON UPDATE CURRENT_TIMESTAMP
    FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
);

-- Junction table for Many-to-Many relationship between User and Organization
-- Defined by @JoinTable({ name: 'organization_members', ... }) in the User entity
CREATE TABLE `organization_members` (
    `user_id` INT NOT NULL,
    `organization_id` INT NOT NULL,
    PRIMARY KEY (`user_id`, `organization_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
);
```