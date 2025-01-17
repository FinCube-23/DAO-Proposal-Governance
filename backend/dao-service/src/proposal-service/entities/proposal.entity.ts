import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ProposalType {
    MEMBERSHIP = 'membership',
    GENERAL = 'general',
}

export enum ProposalStatus {
    PENDING = 'pending',
    CANCEL = 'cancel',
    EXECUTED = 'executed',
    APPROVED = 'approved',
}

@Entity('Proposal')
export class ProposalEntity {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id: number;

    @Column({ type: 'int', nullable: true, default: null })
    @ApiProperty({
        description: "This field will get updated by AUDIT TRAIL SERVICE after on-chain transaction is successfully completed.",
        example: 0,
        required: false
    })
    proposal_onchain_id: number;

    @Column({
        type: 'enum',
        enum: ProposalType,
        default: ProposalType.MEMBERSHIP,
    })
    @ApiProperty({
        description: "There are two types of proposals in our DAO. One is adding new member through major existing member's concent. Another one is proposing new currency.",
        enum: ProposalType,
        example: ProposalType.MEMBERSHIP,
        required: true
    })
    proposal_type: ProposalType;

    @Column({ type: 'varchar', nullable: true })
    @ApiProperty()
    metadata: string;

    @Column({ type: 'varchar' })
    @ApiProperty({
        description: "Before placing each proposal at on-chain the transaction needs to get signed by the proposer wallet. This field will take the signer address as input.",
        example: "0xBb85D1852E67D6BEaa64A7eDba802189F0714F97",
        required: true
    })
    proposer_address: string;

    @Column({ type: 'varchar', nullable: true })
    @ApiProperty({
        description: "A proposal can be cancelled or get executed by some DAO member. This field will store the action taker's wallet address.",
        example: "0xCB6F2B16a15560197342e6afa6b3A5620884265B",
        required: false
    })
    processed_by: string;

    @Column({
        type: 'enum',
        enum: ProposalStatus,
        default: ProposalStatus.PENDING,
    })
    @ApiProperty({
        description: "This field will be automatically updated based on the proposal transaction status and after approval or cancellation and execution of the proposal on-chain",
        enum: ProposalStatus,
        example: ProposalStatus.PENDING,
        required: false
    })
    proposal_status: ProposalStatus;

    @Column({ type: 'varchar', default: false })
    @ApiProperty({
        description: "This field only hold the transaction hash when the proposal is placed.",
        example: "0xe53c868443504e899c093736281f99a9d0b99d66a7b2ecd53575209fe69a8d2a",
        required: true
    })
    trx_hash: string;

    @Column({ type: 'int', nullable: true })
    @ApiProperty({
        description: "This is the primary key from AUDIT TRAIL SERVICE. This field will be assigned through inter-service communication.",
        required: false
    })
    audit_id: number;

    @Column({ type: 'int', default: 0 })
    @ApiProperty({
        description: "This field will be assigned by AUDIT TRAIL SERVICE through inter-service communication.",
        required: false
    })
    trx_status: number;

    @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;
    @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;
}
