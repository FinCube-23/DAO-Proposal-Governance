import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

export enum OnChainProposalStatus {
  REGISTERED = 'register',
  PENDING = 'pending',
  APPROVED = 'approved',
  CANCELLED = 'cancelled',
}

@Entity('mfs_businesses')
export class MfsBusiness {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  @ApiProperty()
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @ApiProperty()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  context: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  type: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  location: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  is_approved: boolean;

  @Column({ type: 'varchar', unique: true, nullable: true })
  @ApiProperty()
  wallet_address: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  native_currency: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  @ApiProperty()
  certificate: string;

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
  proposal_onchain_id: number;

  @Column({
    type: 'enum',
    enum: OnChainProposalStatus,
    default: OnChainProposalStatus.REGISTERED,
    nullable: true,
  })
  membership_onchain_status: OnChainProposalStatus;

  // Use lazy loading for circular reference
  @OneToOne(() => User, (user) => user.mfsBusiness, { nullable: true })
  @ApiProperty({ type: () => User })
  user: User;

  @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;
  @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;

  constructor(partial: Partial<MfsBusiness>) {
    Object.assign(this, partial);
    this.created_at = new Date();
    this.updated_at = new Date();
  }
}
