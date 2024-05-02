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

  @Column({ type: 'integer' })
  @ApiProperty()
  proposal_ID: number;

  @Column({ type: 'varchar' })
  @ApiProperty()
  proposal_metadata: string;

  @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;
  @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;
}
