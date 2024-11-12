import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { ProposalEntity } from 'src/proposal-service/entities/proposal.entity';
@Entity('dao')
export class VotingEntity {
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

  @Column({ type: 'integer', array: true, nullable: true })
  @ApiProperty({ isArray: true })
  proposal_ID: number[];

  @Column({ type: 'varchar', array: true, nullable: true })
  @ApiProperty({ isArray: true })
  proposal_metadata: string[];

  @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;
  @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;
}
