import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { Proposal } from 'src/organization/entities/proposal.entity';

export enum OrganizationApprovalStatus {
  BANNED = 'banned',
  PENDING = 'pending',
  APPROVED = 'approved',
  CANCELLED = 'cancelled',
}

@Entity('organizations')
export class Organization {
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
  type: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  location: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  native_currency: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  @ApiProperty()
  certificate: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: OrganizationApprovalStatus,
    default: OrganizationApprovalStatus.PENDING,
    nullable: true,
  })
  status: OrganizationApprovalStatus;

  @Column({ type: 'int', nullable: true })
  approved_by: number;

  @OneToMany(() => Proposal, (proposal) => proposal.organization)
  proposals: Proposal[];

  @ManyToMany(() => User, (user) => user.organizations)
  users: User[];
  
  @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;
  @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;

  constructor(partial: Partial<Organization>) {
    Object.assign(this, partial);
    this.created_at = new Date();
    this.updated_at = new Date();
  }
}
