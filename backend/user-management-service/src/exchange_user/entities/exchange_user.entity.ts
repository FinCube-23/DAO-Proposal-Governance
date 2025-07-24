import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

@Entity('exchange_users')
export class ExchangeUser {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'varchar' })
  @ApiProperty()
  name: string;

  @Column({ type: 'varchar', unique: true })
  @ApiProperty()
  email: string;

  @Column({ type: 'float' })
  @ApiProperty()
  balance: number;

  @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;
  @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;
}

