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