import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Organization } from './organization.entity';

export enum OnChainProposalStatus {
  REGISTERED = 'register',
  PENDING = 'pending',
  APPROVED = 'approved',
  CANCELLED = 'cancelled',
}

@Entity('proposals')
export class Proposal {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true, length: 255, default: null })
  @ApiProperty()
  trx_hash: string;

  @Column({ type: 'int', nullable: true, default: null })
  @ApiProperty({
    description:
      'This field will get updated by AUDIT TRAIL SERVICE after on-chain transaction is successfully completed.',
    example: 0,
    required: false,
  })
  onchain_id: number;

  @Column({ type: 'varchar', length: 255 })
  proposed_wallet: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  context: string;

  @Column({
    type: 'enum',
    enum: OnChainProposalStatus,
    default: OnChainProposalStatus.REGISTERED,
    nullable: true,
  })
  onchain_status: OnChainProposalStatus;

  @ManyToOne(() => Organization, (org) => org.proposals, { onDelete: 'CASCADE' })
  organization: Organization;

  @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;
  @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;

  constructor(partial: Partial<Proposal>) {
    Object.assign(this, partial);
    this.created_at = new Date();
    this.updated_at = new Date();
  }
}
