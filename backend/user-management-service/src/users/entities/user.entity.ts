import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MfsBusiness } from 'src/mfs_business/entities/mfs_business.entity';
import { ExchangeUser } from 'src/exchange_user/entities/exchange_user.entity';
import { Role } from '../dtos/create-user.dto';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  name: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  password: string;

  @Column({ type: 'enum', enum: Role })
  @ApiProperty()
  role: Role;

  // Use lazy loading here
  @OneToOne(() => MfsBusiness, (mfsBusiness) => mfsBusiness.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  @ApiProperty({ type: () => MfsBusiness }) // Use the lazy loading for Swagger
  mfsBusiness: MfsBusiness;

  @OneToOne(() => ExchangeUser, (exchangeUser) => exchangeUser.user, {
    nullable: true,
  })
  @JoinColumn()
  @ApiProperty({ type: () => ExchangeUser }) // Use the lazy loading for Swagger
  exchangeUser: ExchangeUser;

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
