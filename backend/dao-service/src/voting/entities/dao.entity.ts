import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('dao')
export class DAOEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'varchar' })
  @ApiProperty()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty()
  token_name: string;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty()
  token_address: string;

  @Column({ type: 'float', nullable: true })
  @ApiProperty()
  royalty_amount: number;

  @Column({ type: 'varchar' })
  @ApiProperty()
  address: string;

  @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;
  @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;
}
