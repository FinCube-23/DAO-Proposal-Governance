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

    @Column({ type: 'int', nullable: true })
    @ApiProperty()
    proposal_onchain_id: number;

    @Column({
        type: 'enum',
        enum: ProposalType,
        default: ProposalType.MEMBERSHIP,
    })
    @ApiProperty({ enum: ProposalType })
    proposal_type: ProposalType;

    @Column({ type: 'varchar' })
    @ApiProperty()
    metadata: string;

    @Column({ type: 'varchar' })
    @ApiProperty()
    proposer_address: string;

    @Column({ type: 'varchar', nullable: true })
    @ApiProperty()
    proposal_executed_by: string;

    @Column({ type: 'boolean', default: false })
    @ApiProperty()
    external_proposal: boolean;

    @Column({
        type: 'enum',
        enum: ProposalStatus,
        default: ProposalStatus.PENDING,
    })
    @ApiProperty({ enum: ProposalStatus })
    proposal_status: ProposalStatus;

    @Column({ type: 'varchar', default: false })
    @ApiProperty()
    trx_hash: string;

    @Column({ type: 'int', default: 0 })
    @ApiProperty()
    trx_status: number;

    @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;
    @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;
}
