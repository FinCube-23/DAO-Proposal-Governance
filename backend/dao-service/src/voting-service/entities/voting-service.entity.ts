import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dao')
export class VotingServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  token_name: string;

  @Column({ type: 'varchar' })
  token_address: string;

  @Column({ type: 'float' })
  royalty_amount: number;

  @Column({ type: 'varchar' })
  address: string;
}
