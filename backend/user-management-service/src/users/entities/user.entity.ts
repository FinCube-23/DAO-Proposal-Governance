import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Organization } from 'src/organization/entities/organization.entity';
import { Role } from '../dtos/create-user.dto';

export enum UserProfileStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  CANCELLED = 'cancelled',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @ApiProperty()
  email: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  is_verified_email: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  wallet_address: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  password: string;

  @Column({ type: 'enum', enum: Role })
  @ApiProperty()
  role: Role;

  @Column({ type: 'varchar', length: 20, unique: true })
  @ApiProperty()
  contact_number: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  is_verified_contact: boolean;

  @Column({
    type: 'enum',
    enum: UserProfileStatus,
    default: UserProfileStatus.PENDING,
    nullable: true,
  })
  onchain_status: UserProfileStatus;

  @ManyToMany(() => Organization, (organization) => organization.users, {
    cascade: true,
  })
  @JoinTable({
    name: 'user_organizations', // name of the join table
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'organization_id', referencedColumnName: 'id' },
  })
  organizations: Organization[];

  @CreateDateColumn({ name: 'created_at' })
  'created_at': Date;

  @UpdateDateColumn({ name: 'updated_at' })
  'updated_at': Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
    this.created_at = new Date();
    this.updated_at = new Date();
  }
}
